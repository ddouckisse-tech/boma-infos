#!/usr/bin/env python3
"""Archive the public Le Corporate WordPress API and source media (stdlib only).

Run from any directory: python3 scripts/export-wordpress.py
Completed API pages and SHA-256-verified media are reused on subsequent runs.
Use --refresh-api to refresh the public JSON snapshot; media still resume.
Only HTTPS public addresses on the site or hosts explicitly listed by its media
records are fetched. No authentication, WordPress writes, or production access.
"""

import argparse
import collections
import concurrent.futures
import datetime
import functools
import hashlib
import html.parser
import ipaddress
import json
import mimetypes
import os
from pathlib import Path
import re
import socket
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET


BASE = "https://le-corporate.com"
RESOURCES = ("posts", "media", "categories", "tags", "users", "pages")
SITE_HOSTS = {"le-corporate.com", "www.le-corporate.com"}
USER_AGENT = "LeCorporate-authorized-public-migration/1.0"
TIMEOUT = 60
ATTEMPTS = 4
LOCAL = threading.local()


def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def atomic_bytes(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(path.name + ".tmp")
    temporary.write_bytes(data)
    os.replace(temporary, path)


def save_json(path, value):
    atomic_bytes(path, (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode())


def read_json(path, fallback=None):
    try:
        return json.loads(path.read_text())
    except (OSError, ValueError):
        return fallback


def digest_file(path):
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


@functools.lru_cache(maxsize=256)
def check_public_host(host):
    addresses = socket.getaddrinfo(host, 443, type=socket.SOCK_STREAM)
    if not addresses or any(not ipaddress.ip_address(row[4][0]).is_global for row in addresses):
        raise ValueError("Refusing non-public destination: " + host)


def checked_url(url, allowed_hosts):
    parts = urllib.parse.urlsplit(url)
    if (parts.scheme != "https" or not parts.hostname or parts.username or
            parts.password or parts.port not in (None, 443)):
        raise ValueError("Only credential-free HTTPS on port 443 is allowed: " + url)
    if parts.hostname.lower() not in allowed_hosts:
        raise ValueError("Host not listed by the source site: " + parts.hostname)
    check_public_host(parts.hostname)
    return urllib.parse.urlunsplit((parts.scheme, parts.netloc,
        urllib.parse.quote(parts.path, safe="/%:@!$&'()*+,;=-._~"),
        urllib.parse.quote(parts.query, safe="%=&;:+,/?@-._~"), ""))


class PublicRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, response, code, message, headers, new_url):
        new_url = checked_url(new_url, LOCAL.allowed_hosts)
        return super().redirect_request(request, response, code, message, headers, new_url)


def open_url(url, allowed_hosts, headers=None):
    LOCAL.allowed_hosts = allowed_hosts
    if not hasattr(LOCAL, "opener"):
        LOCAL.opener = urllib.request.build_opener(PublicRedirect())
    request = urllib.request.Request(checked_url(url, allowed_hosts), headers={
        "User-Agent": USER_AGENT, "Accept-Encoding": "identity", **(headers or {})})
    return LOCAL.opener.open(request, timeout=TIMEOUT)


def with_retry(operation):
    for attempt in range(ATTEMPTS):
        try:
            return operation()
        except Exception as error:
            retryable = not isinstance(error, ValueError)
            if isinstance(error, urllib.error.HTTPError):
                retryable = error.code in (408, 425, 429, 500, 502, 503, 504)
            if attempt == ATTEMPTS - 1 or not retryable:
                raise
            delay = min(2 ** attempt * 2, 15)
            if isinstance(error, urllib.error.HTTPError):
                retry_after = error.headers.get("Retry-After", "")
                if retry_after.isdigit():
                    delay = min(int(retry_after), 60)
            time.sleep(delay)


def fetch_bytes(url):
    def attempt():
        with open_url(url, SITE_HOSTS) as response:
            content = response.read()
            length = response.headers.get("Content-Length")
            if length is not None and len(content) != int(length):
                raise IOError("Response size differs from Content-Length")
            return content, {
                "url": url, "final_url": response.url, "status": response.status,
                "fetched_at": now(), "headers": dict(response.headers),
                "bytes": len(content), "sha256": hashlib.sha256(content).hexdigest(),
            }
    return with_retry(attempt)


def cached_fetch(path, url, refresh):
    metadata_path = path.with_name(path.name + ".headers.json")
    metadata = read_json(metadata_path, {})
    if (not refresh and path.is_file() and metadata.get("url") == url and
            metadata.get("bytes") == path.stat().st_size and
            metadata.get("sha256") == digest_file(path)):
        return path.read_bytes(), metadata
    content, metadata = fetch_bytes(url)
    atomic_bytes(path, content)
    save_json(metadata_path, metadata)
    return content, metadata


def collect_resource(raw, resource, refresh, query_extra=None, archive_name=None):
    archive_name = archive_name or resource
    records, pages = [], []
    total_pages, expected_total = 1, None
    page = 1
    while page <= total_pages:
        query = urllib.parse.urlencode({"per_page": 100, "page": page, **(query_extra or {})})
        url = BASE + "/wp-json/wp/v2/" + resource + "?" + query
        data, metadata = cached_fetch(raw / "api" / archive_name / f"page-{page:04d}.json", url, refresh)
        items = json.loads(data)
        if not isinstance(items, list):
            raise ValueError(resource + " did not return a collection")
        headers = {key.lower(): value for key, value in metadata["headers"].items()}
        current_total = int(headers["x-wp-total"])
        current_pages = int(headers["x-wp-totalpages"])
        if expected_total is None:
            expected_total, total_pages = current_total, current_pages
        if expected_total != current_total or total_pages != current_pages:
            raise ValueError(resource + " totals changed during export; rerun with --refresh-api")
        records.extend(items)
        pages.append({"page": page, "count": len(items), **metadata})
        print(f"{archive_name}: page {page}/{max(total_pages, 1)}, {len(records)}/{expected_total}", flush=True)
        page += 1
    save_json(raw / (archive_name + ".json"), records)
    summary = {"count": len(records), "x_wp_total": expected_total,
               "x_wp_total_pages": total_pages, "pages": pages,
               "unique_ids": len({item["id"] for item in records}),
               "count_matches_total": len(records) == expected_total,
               "unique_ids_match_total": len({item["id"] for item in records}) == expected_total}
    save_json(raw / (archive_name + ".export.json"), summary)
    return records, {key: value for key, value in summary.items() if key != "pages"}


def archive_sitemaps(raw, refresh, kind="post"):
    data, _ = cached_fetch(raw / "sitemaps" / "sitemap_index.xml", BASE + "/sitemap_index.xml", refresh)
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = [node.text for node in ET.fromstring(data).findall("sm:sitemap/sm:loc", ns)]
    post_sitemaps = [url for url in urls if re.fullmatch(kind + r"-sitemap\d*\.xml", urllib.parse.urlsplit(url).path.rsplit("/", 1)[-1])]
    if not post_sitemaps:
        raise ValueError("No " + kind + " sitemap in sitemap index")
    entries, summary = [], []
    for url in post_sitemaps:
        name = urllib.parse.urlsplit(url).path.rsplit("/", 1)[-1]
        data, _ = cached_fetch(raw / "sitemaps" / name, url, refresh)
        locations = [node.text for node in ET.fromstring(data).findall("sm:url/sm:loc", ns)]
        entries.extend(locations)
        summary.append({"url": url, "count": len(locations)})
    return entries, summary


class AttachmentParser(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.media_id = None
        self.in_attachment = False
        self.source = None
        self.image = {}

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "body":
            match = re.search(r"\battachmentid-(\d+)\b", attrs.get("class", ""))
            if match:
                self.media_id = int(match.group(1))
        if tag == "link" and attrs.get("rel") == "shortlink" and not self.media_id:
            query = urllib.parse.parse_qs(urllib.parse.urlsplit(attrs.get("href", "")).query)
            if query.get("p", [""])[0].isdigit():
                self.media_id = int(query["p"][0])
        if tag == "p" and "attachment" in attrs.get("class", "").split():
            self.in_attachment = True
        if self.in_attachment and tag == "a" and not self.source:
            self.source = attrs.get("href")
        if self.in_attachment and tag == "img":
            self.image = attrs

    def handle_endtag(self, tag):
        if tag == "p":
            self.in_attachment = False


def collect_supplemental_media(raw, posts, media, attachment_urls, refresh):
    """Keep synthesized public-page metadata separate from exact REST responses."""
    media_ids = {item["id"] for item in media}
    media_links = {item.get("link") for item in media}
    supplemental, errors = {}, []
    for post in posts:
        media_id = post.get("featured_media")
        if not media_id or media_id in media_ids:
            continue
        images = post.get("yoast_head_json", {}).get("og_image", [])
        if not images:
            errors.append({"post_id": post["id"], "media_id": media_id, "error": "No public OG image"})
            continue
        image = images[0]
        source = image["url"]
        supplemental[media_id] = {
            "id": media_id, "source_url": source, "mime_type": image.get("type"), "media_type": "image",
            "title": {"rendered": Path(urllib.parse.unquote(urllib.parse.urlsplit(source).path)).stem},
            "alt_text": "", "caption": {"rendered": ""},
            "media_details": {key: image[key] for key in ("width", "height") if key in image},
            "_migration_provenance": {"kind": "public_post_og_image", "post_id": post["id"],
                "post_url": post["link"], "json_path": "yoast_head_json.og_image[0]",
                "note": "Synthesized from public post metadata; not a REST media response"},
        }
    for url in sorted(set(attachment_urls) - media_links):
        try:
            filename = hashlib.sha256(url.encode()).hexdigest()[:20] + ".html"
            content, metadata = cached_fetch(raw / "attachment-pages" / filename, url, refresh)
            parser = AttachmentParser()
            parser.feed(content.decode("utf-8"))
            if not parser.media_id or not parser.source:
                raise ValueError("Public attachment page has no attachment ID / original link")
            source = urllib.parse.urljoin(metadata["final_url"], parser.source)
            details = {}
            if parser.image.get("src") == source:
                details = {key: int(parser.image[key]) for key in ("width", "height")
                           if parser.image.get(key, "").isdigit()}
            supplemental[parser.media_id] = {
                "id": parser.media_id, "source_url": source, "link": url,
                "mime_type": mimetypes.guess_type(source)[0] or "application/octet-stream",
                "media_type": "image", "title": {"rendered": Path(urllib.parse.urlsplit(source).path).stem},
                "alt_text": parser.image.get("alt", ""), "caption": {"rendered": ""},
                "media_details": details,
                "_migration_provenance": {"kind": "public_attachment_page", "page_url": url,
                    "archive_file": "attachment-pages/" + filename,
                    "original_url_from": "p.attachment > a[href]", "id_from": "body attachmentid / shortlink",
                    "displayed_image": parser.image,
                    "note": "Synthesized from public attachment HTML; not a REST media response"},
            }
            print(f"supplemental media: {parser.media_id} from {url}", flush=True)
        except Exception as error:
            errors.append({"url": url, "error": str(error)})
    save_json(raw / "media-supplemental.json", list(supplemental.values()))
    save_json(raw / "media-supplemental-errors.json", errors)
    return list(supplemental.values()), errors


def media_filename(item):
    suffix = Path(urllib.parse.unquote(urllib.parse.urlsplit(item.get("source_url", "")).path)).suffix.lower()
    if not re.fullmatch(r"\.[a-z0-9]{1,8}", suffix):
        suffix = mimetypes.guess_extension(item.get("mime_type", "")) or ".bin"
    return str(int(item["id"])) + suffix


def download_media(item, originals, previous, allowed_hosts):
    media_id, source = str(item["id"]), item.get("source_url", "")
    filename = media_filename(item)
    destination = originals / filename
    expected_size = item.get("media_details", {}).get("filesize")
    entry = {"id": item["id"], "source_url": source, "filename": filename,
             "mime_type": item.get("mime_type"), "api_filesize": expected_size}
    existing = previous.get(media_id, {})
    if (existing.get("status") == "ok" and existing.get("source_url") == source and
            existing.get("filename") == filename and destination.is_file() and
            existing.get("bytes") == destination.stat().st_size and
            existing.get("sha256") == digest_file(destination)):
        return {**existing, "resumed": True}
    temporary = destination.with_suffix(destination.suffix + ".part")
    partial_metadata_path = temporary.with_suffix(temporary.suffix + ".json")
    partial_metadata = read_json(partial_metadata_path, {})
    if partial_metadata.get("source_url") != source:
        temporary.unlink(missing_ok=True)
        partial_metadata_path.unlink(missing_ok=True)

    def attempt():
        while True:
            offset = temporary.stat().st_size if temporary.exists() else 0
            previous_response = read_json(partial_metadata_path, {})
            headers = {"Range": f"bytes={offset}-{offset + 4 * 1024 * 1024 - 1}"}
            validator = previous_response.get("etag") or previous_response.get("last_modified")
            if offset and validator:
                headers["If-Range"] = validator
            with open_url(source, allowed_hosts, headers) as response:
                response_type = response.headers.get_content_type()
                if response_type == "text/html" and item.get("mime_type") != "text/html":
                    raise ValueError("Media URL returned an HTML page")
                content_length = response.headers.get("Content-Length")
                range_value = response.headers.get("Content-Range", "")
                if response.status == 206:
                    match = re.fullmatch(r"bytes (\d+)-(\d+)/(\d+)", range_value)
                    if not match or int(match.group(1)) != offset:
                        raise ValueError("Invalid Content-Range: " + range_value)
                    total = int(match.group(3))
                    requested_bytes = int(match.group(2)) - offset + 1
                    mode = "ab"
                else:
                    offset = 0
                    total = int(content_length) if content_length else None
                    requested_bytes = total
                    mode = "wb"
                response_metadata = {"source_url": source, "total": total,
                    "etag": response.headers.get("ETag"),
                    "last_modified": response.headers.get("Last-Modified")}
                save_json(partial_metadata_path, response_metadata)
                received = 0
                with temporary.open(mode) as output:
                    for chunk in iter(lambda: response.read(256 * 1024), b""):
                        received += len(chunk)
                        output.write(chunk)
                if content_length is not None and received != int(content_length):
                    raise IOError(f"Incomplete range: {received} bytes vs Content-Length {content_length}")
                if requested_bytes is not None and received != requested_bytes:
                    raise IOError("Downloaded range length differs from Content-Range")
                count = offset + received
                if received == 0 or (total is not None and count > total):
                    raise IOError("Empty or oversized media response")
                if total is None or count == total:
                    result = {**entry, "status": "ok", "bytes": count, "sha256": digest_file(temporary),
                        "content_length": total, "response_content_type": response_type,
                        "final_url": response.url, "downloaded_at": now(), "resumed": False}
                    break
        if isinstance(expected_size, int) and expected_size != count:
            result["size_warning"] = f"API filesize {expected_size} differs from downloaded {count}"
        os.replace(temporary, destination)
        partial_metadata_path.unlink(missing_ok=True)
        return result

    try:
        return with_retry(attempt)
    except Exception as error:
        return {**entry, "status": "error", "error": str(error),
                "error_type": type(error).__name__, "attempted_at": now(),
                "partial_bytes": temporary.stat().st_size if temporary.exists() else 0}


class ContentParser(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = collections.Counter()
        self.images = []
        self.embeds = []

    def handle_starttag(self, tag, attrs):
        self.tags[tag] += 1
        attrs = dict(attrs)
        if tag == "img":
            self.images.append(attrs.get("src", ""))
        if tag in ("iframe", "video", "audio", "embed"):
            self.embeds.append({"tag": tag, "src": attrs.get("src", "")})


def content_observations(resources, manifest):
    posts = resources.get("posts", [])
    media = {row["id"]: row for row in resources.get("media", [])}
    known_urls = {}
    for row in media.values():
        known_urls[row.get("source_url", "")] = row["id"]
        for size in row.get("media_details", {}).get("sizes", {}).values():
            if isinstance(size, dict) and size.get("source_url"):
                known_urls[size["source_url"]] = row["id"]
    all_tags = collections.Counter()
    no_featured, missing_featured, failed_featured, unmatched_images = [], [], [], []
    embeds, protected, shortcodes, empty, blocks = [], [], [], [], []
    for post in posts:
        post_id = post["id"]
        featured = post.get("featured_media", 0)
        if not featured:
            no_featured.append(post_id)
        elif featured not in media:
            missing_featured.append({"post_id": post_id, "media_id": featured})
        elif manifest.get(str(featured), {}).get("status") != "ok":
            failed_featured.append({"post_id": post_id, "media_id": featured})
        content = post.get("content", {}).get("rendered", "")
        parser = ContentParser()
        parser.feed(content)
        all_tags.update(parser.tags)
        for source in parser.images:
            if source not in known_urls:
                unmatched_images.append({"post_id": post_id, "source_url": source})
        if parser.embeds:
            embeds.append({"post_id": post_id, "embeds": parser.embeds})
        if post.get("content", {}).get("protected"):
            protected.append(post_id)
        if not content.strip():
            empty.append(post_id)
        if "<!-- wp:" in content:
            blocks.append(post_id)
        if re.search(r"\[(?:vc_|elementor|gallery|caption|embed)[^\]]*\]", content):
            shortcodes.append(post_id)
    return {
        "posts_without_featured_media": no_featured,
        "featured_media_missing_from_api": missing_featured,
        "featured_media_download_failed": failed_featured,
        "inline_images_not_matched_to_api_media_or_sizes": unmatched_images,
        "posts_with_embeds": embeds, "protected_posts": protected, "empty_content_posts": empty,
        "posts_with_gutenberg_comments": blocks, "posts_with_common_shortcodes": shortcodes,
        "html_tag_counts": dict(all_tags),
        "post_status_counts": dict(collections.Counter(row.get("status") for row in posts)),
        "post_format_counts": dict(collections.Counter(row.get("format") for row in posts)),
        "post_author_counts": dict(collections.Counter(row.get("author") for row in posts)),
        "post_date_min": min((row.get("date", "") for row in posts), default=None),
        "post_date_max": max((row.get("date", "") for row in posts), default=None),
        "media_with_separate_original_image": [row["id"] for row in media.values()
            if row.get("media_details", {}).get("original_image")],
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--refresh-api", action="store_true", help="Refetch API pages and sitemaps")
    parser.add_argument("--workers", type=int, choices=range(1, 5), default=4)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1] / ".migration" / "le-corporate"
    raw, originals = root / "raw", root / "originals"
    raw.mkdir(parents=True, exist_ok=True)
    originals.mkdir(parents=True, exist_ok=True)
    report = {"started_at": now(), "source": BASE, "resources": {}, "errors": []}
    resources = {}
    for name in RESOURCES:
        try:
            resources[name], report["resources"][name] = collect_resource(raw, name, args.refresh_api)
            if not report["resources"][name]["unique_ids_match_total"]:
                report["errors"].append({"resource": name,
                    "error": "Public API records / unique IDs differ from X-WP-Total; all returned records are archived"})
        except Exception as error:
            report["errors"].append({"resource": name, "error": str(error)})
            print(f"ERROR {name}: {error}", flush=True)
        save_json(raw / "report.json", report)
    if "media" in resources and not report["resources"]["media"]["unique_ids_match_total"]:
        try:
            ascending, summary = collect_resource(raw, "media", args.refresh_api,
                {"orderby": "id", "order": "asc"}, "media-id-asc")
            merged = {item["id"]: item for item in resources["media"]}
            additional = [item["id"] for item in ascending if item["id"] not in merged]
            merged.update({item["id"]: item for item in ascending})
            resources["media"] = list(merged.values())
            save_json(raw / "media.json", resources["media"])
            report["media_ascending_check"] = {**summary, "additional_ids": additional,
                "union_count": len(merged)}
        except Exception as error:
            report["errors"].append({"resource": "media-id-asc", "error": str(error)})
    try:
        sitemap_urls, report["post_sitemaps"] = archive_sitemaps(raw, args.refresh_api)
        api_urls = {post["link"] for post in resources.get("posts", [])}
        report["sitemap_coverage"] = {
            "sitemap_entries": len(sitemap_urls), "unique_sitemap_urls": len(set(sitemap_urls)),
            "api_post_urls": len(api_urls),
            "sitemap_urls_missing_from_api": sorted(set(sitemap_urls) - api_urls),
            "api_post_urls_missing_from_sitemaps": sorted(api_urls - set(sitemap_urls)),
        }
    except Exception as error:
        report["errors"].append({"resource": "sitemaps", "error": str(error)})
    supplemental = []
    try:
        attachment_urls, report["attachment_sitemaps"] = archive_sitemaps(raw, args.refresh_api, "attachment")
        known_links = {item["link"] for item in resources.get("media", [])}
        report["attachment_sitemap_coverage"] = {
            "sitemap_entries": len(attachment_urls),
            "sitemap_urls_missing_from_api": sorted(set(attachment_urls) - known_links),
            "api_urls_missing_from_sitemaps": sorted(known_links - set(attachment_urls)),
        }
        supplemental, supplemental_errors = collect_supplemental_media(raw,
            resources.get("posts", []), resources.get("media", []), attachment_urls, args.refresh_api)
        report["errors"].extend({"resource": "supplemental-media", **error} for error in supplemental_errors)
    except Exception as error:
        report["errors"].append({"resource": "supplemental-media", "error": str(error)})
    media = list({item["id"]: item for item in [*resources.get("media", []), *supplemental]}.values())
    report["media_supplemental"] = {"count": len(supplemental), "ids": [item["id"] for item in supplemental],
        "combined_count": len(media), "matches_x_wp_total": len(media) == report["resources"].get("media", {}).get("x_wp_total")}
    allowed_hosts = set(SITE_HOSTS)
    for item in media:
        parts = urllib.parse.urlsplit(item.get("source_url", ""))
        if parts.scheme == "https" and parts.hostname:
            allowed_hosts.add(parts.hostname.lower())
    manifest_path = raw / "media-manifest.json"
    previous = read_json(manifest_path, {})
    manifest = {str(item["id"]): previous[str(item["id"])] for item in media if str(item["id"]) in previous}
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as executor:
        futures = [executor.submit(download_media, item, originals, previous, allowed_hosts) for item in media]
        for count, future in enumerate(concurrent.futures.as_completed(futures), 1):
            entry = future.result()
            manifest[str(entry["id"])] = entry
            save_json(manifest_path, manifest)
            if count % 50 == 0 or entry["status"] != "ok" or count == len(media):
                print(f"media downloads: {count}/{len(media)}, {entry['id']}: {entry['status']}", flush=True)
    good = [entry for entry in manifest.values() if entry.get("status") == "ok"]
    failed = [entry for entry in manifest.values() if entry.get("status") != "ok"]
    report["media_downloads"] = {
        "expected": len(media), "successful": len(good), "failed": len(failed),
        "resumed": sum(bool(entry.get("resumed")) for entry in good),
        "total_bytes": sum(entry["bytes"] for entry in good),
        "mime_type_counts": dict(collections.Counter(item.get("mime_type") for item in media)),
        "extension_counts": dict(collections.Counter(Path(entry["filename"]).suffix for entry in good)),
        "size_warnings": [entry for entry in good if entry.get("size_warning")],
        "errors": failed, "allowed_hosts": sorted(allowed_hosts),
    }
    save_json(raw / "media-errors.json", failed)
    report["content_observations"] = content_observations(resources, manifest)
    report["content_observations_with_supplemental"] = content_observations({**resources, "media": media}, manifest)
    report["unavailable_inline_images"] = read_json(raw / "unavailable-images.json", [])
    report["original_media_variant_checks"] = read_json(raw / "media-52-variant-checks.json", [])
    report["completed_at"] = now()
    report["complete"] = not report["errors"] and not failed and len(resources) == len(RESOURCES)
    save_json(raw / "report.json", report)
    print(json.dumps({"complete": report["complete"], "counts": report["resources"],
        "media_successful": len(good), "media_failed": len(failed),
        "media_bytes": report["media_downloads"]["total_bytes"], "report": str(raw / "report.json")}, indent=2), flush=True)
    return 0 if report["complete"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
