#!/usr/bin/env python3
"""Convert the archived public WordPress corpus to validated editorial blocks.

Requires lxml. Run after export-wordpress.py. No network or database writes.
The complete original HTML remains in raw/posts.json for audit and recovery.
"""
import collections
import datetime as dt
import html
import json
from pathlib import Path
import re
from urllib.parse import unquote, urljoin, urlsplit
from lxml import html as dom

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / '.migration/le-corporate'
SOURCE = 'https://le-corporate.com'
SLUG_MAP = {'business-life-style': 'business-lifestyle',
            'intelligence-economique-fortune-dafrique': 'intelligence-economique'}
ORDER = ['business-lifestyle', 'editorial', 'succes-story', 'espace-pro',
         'tribune', 'dossier-special', 'intelligence-economique', 'interview', 'non-classe']
SKIP = {'script', 'style', 'noscript'}

def load(name):
    return json.loads((BASE / 'raw' / (name + '.json')).read_text())

def clean(value):
    return re.sub(r'\s+', ' ', html.unescape(value or '')).strip()

def tree(value):
    return dom.fragment_fromstring(value or '', create_parent='div')

def plain(value):
    return clean(tree(value).text_content())

def stamp(value):
    return int(dt.datetime.fromisoformat(value.removesuffix('Z')).replace(tzinfo=dt.timezone.utc).timestamp()*1000)

def main():
    posts, media, categories, users, tags = (load(k) for k in ['posts','media','categories','users','tags'])
    supplemental = BASE / 'raw/media-supplemental.json'
    if supplemental.exists():
        media = list({m['id']:m for m in [*media,*json.loads(supplemental.read_text())]}.values())
    unavailable_file = BASE / 'raw/unavailable-images.json'
    unavailable = json.loads(unavailable_file.read_text()) if unavailable_file.exists() else []
    unavailable_urls = {item['url'] for item in unavailable}
    by_category = {x['id']: x for x in categories}
    by_tag = {x['id']: plain(x['name']) for x in tags}
    post_links = {unquote(urlsplit(x['link']).path).rstrip('/'): x['slug'] for x in posts}
    by_post_id = {str(x['id']): x['slug'] for x in posts}
    media_urls = {}
    for m in media:
        for address in [m.get('source_url',''), *[s.get('source_url','') for s in m.get('media_details',{}).get('sizes',{}).values()]]:
            if address:
                media_urls[unquote(urlsplit(address).path)] = m['id']
    image_ids = {m['id'] for m in media if m.get('mime_type','').startswith('image/')}
    pdf_urls = {unquote(urlsplit(m['source_url']).path):m['id'] for m in media if m.get('mime_type')=='application/pdf'}
    unknown_images, unsupported, text_gaps = [], collections.Counter(), []

    def category_slug(c): return SLUG_MAP.get(c['slug'], c['slug'])

    def rewrite(address):
        if not address: return ''
        address = urljoin(SOURCE, html.unescape(address))
        u = urlsplit(address)
        if u.scheme not in {'https','http','mailto','tel'}: return ''
        if u.hostname in {'le-corporate.com','www.le-corporate.com'}:
            path = unquote(u.path).rstrip('/')
            if path in pdf_urls: return f'/documents/wordpress-{pdf_urls[path]}.pdf'
            if path in post_links: return '/article/' + post_links[path] + (('#'+u.fragment) if u.fragment else '')
            if path.startswith('/category/'):
                slug = path.split('/')[-1]
                c = next((x for x in categories if x['slug']==slug), None)
                if c:
                    return '/rubrique/' + (category_slug(by_category[c['parent']])+'/' if c['parent'] else '') + category_slug(c)
            if u.query.startswith('p=') and u.query[2:] in by_post_id:
                return '/article/' + by_post_id[u.query[2:]]
            if path in {'/a-propos','/contacts',''}: return path or '/'
        # Keep links to external references and original downloadable attachments.
        return address.replace(' ', '%20').replace('(', '%28').replace(')', '%29')

    def inline(el):
        if not isinstance(el.tag,str) or el.tag.lower() in SKIP | {'img','iframe'}: return ''
        tag = el.tag.lower()
        result = el.text or ''
        for child in el:
            result += (' ' if child.tag == 'br' else inline(child)) + (child.tail or '')
        if not result: return ''
        # Preserve whitespace across inline element boundaries (including NBSP).
        match = re.match(r'^(\s*)(.*?)(\s*)$',result,re.S)
        lead,core,tail = match.groups()
        if tag in {'strong','b'}: return lead+'**'+core.replace('**','')+'**'+tail if core else result
        if tag in {'em','i'}: return lead+'*'+re.sub(r'(?<!\*)\*(?!\*)','',core)+'*'+tail if core else result
        if tag == 'a':
            href = rewrite(el.get('href'))
            if href and core: return lead+'['+core.replace('[','').replace(']','')+']('+href+')'+tail
        return result

    prepared = []
    for post in posts:
        root = tree(post['content']['rendered'])
        for bad in root.xpath('//script|//style|//noscript'):
            bad.drop_tree()
        blocks = []
        def paragraph(text):
            if clean(text): blocks.append({'type':'paragraph','text':clean(text).replace('****','')})
        def picture(el, caption=''):
            src = el.get('data-src') or el.get('src') or ''
            mid = media_urls.get(unquote(urlsplit(urljoin(SOURCE,src)).path))
            match = re.search(r'wp-image-(\d+)', el.get('class',''))
            if not mid and match and int(match[1]) in image_ids: mid=int(match[1])
            if mid not in image_ids:
                if src not in unavailable_urls:
                    unknown_images.append({'postId':post['id'],'url':src,'alt':el.get('alt','')})
                return
            block = {'type':'image','mediaKey':f'wp-media-{mid}'}
            if caption: block['caption']=caption
            blocks.append(block)
        def walk(el):
            if not isinstance(el.tag,str): return
            tag = el.tag.lower()
            if tag in SKIP: return
            if tag == 'img': picture(el); return
            if tag == 'figure':
                captions = el.xpath('.//figcaption')
                caption = clean(' '.join(c.text_content() for c in captions))
                pictures = el.xpath('.//img')
                if pictures:
                    for pic in pictures: picture(pic,caption)
                    return
            if tag in {'p','h1','h2','h3','h4','h5','h6','blockquote','ul','ol','tr'}:
                text = inline(el)
                if tag in {'ul','ol'}:
                    items = [inline(x) for x in el if x.tag == 'li']
                    if items: blocks.append({'type':'list','ordered':tag=='ol','items':items})
                elif tag.startswith('h'):
                    if text: blocks.append({'type':'heading','level':2 if tag in {'h1','h2'} else 3,'text':clean(el.text_content())})
                elif tag=='blockquote':
                    if text: blocks.append({'type':'quote','text':clean(el.text_content())})
                elif tag=='tr': paragraph(' | '.join(inline(c) for c in el))
                else: paragraph(text)
                for pic in el.xpath('.//img'): picture(pic)
                return
            if tag in {'iframe','video','audio'}:
                address = rewrite(el.get('src') or next(iter(el.xpath('.//source/@src')), ''))
                if address: paragraph('[Consulter le média]('+address+')')
                unsupported[tag] += 1
                return
            if tag not in {'div','section','article','figure','figcaption','table','thead','tbody','tfoot','span','a','br'}:
                unsupported[tag] += 1
            if tag in {'a','span','strong','b','em','i'}:
                paragraph(inline(el))
                for pic in el.xpath('.//img'): picture(pic)
                return
            paragraph(el.text or '')
            for child in el:
                walk(child)
                paragraph(child.tail or '')
        walk(root)
        # Keep every word from the editorial HTML; report any omissions before import.
        expected = collections.Counter(re.findall(r'\w', clean(root.text_content()).casefold()))
        actual_text = ' '.join(b.get('text','')+' '+b.get('caption','')+' '+' '.join(b.get('items',[])) for b in blocks)
        actual_text = re.sub(r'\[([^\]]+)\]\([^)]*\)', r'\1',actual_text)
        actual = collections.Counter(re.findall(r'\w', actual_text.casefold()))
        missing = expected - actual
        if missing: text_gaps.append({'id':post['id'],'missingCharacters':dict(missing)})
        cs = [by_category[c] for c in post.get('categories',[]) if c in by_category]
        cs.sort(key=lambda c:(not bool(c['parent']), c['slug']=='non-classe'))
        chosen = cs[0] if cs else by_category[1]
        parent = by_category.get(chosen['parent'])
        category = category_slug(parent or chosen)
        title = plain(post['title']['rendered'])
        dek = plain(post.get('excerpt',{}).get('rendered',''))
        dek = re.sub(r'\s*(?:\[&hellip;\]|\[\.\.\.\]|\[…\])\s*$', '',dek)
        if not dek: dek=clean(root.text_content())[:280]
        tag_names = list(dict.fromkeys([by_tag[t] for t in post.get('tags',[]) if t in by_tag]))
        body_text = clean(root.text_content())
        item = {'title':title,'slug':post['slug'],'dek':dek,'body':blocks,
                'status':'published','categorySlug':category,'authorSlug':'le-corporate',
                'galleryMediaKeys':[], 'keyPoints':[],
                'seo':{'description':plain(post.get('yoast_head_json',{}).get('description','')) or dek[:300], 'keywords':tag_names},
                'origin':'redaction','feature':'none','readingMinutes':max(1,round(len(body_text.split())/230)),
                'tags':tag_names,'createdAt':stamp(post['date_gmt'] or post['date']),
                'publishedAt':stamp(post['date_gmt'] or post['date']),
                'updatedAt':stamp(post['modified_gmt'] or post['modified']),
                'views':0,'searchText':' '.join([title,dek,body_text,*tag_names]),
                'wordpressId':post['id'],'sourceUrl':post['link'],
                'sourceCategorySlugs':[category_slug(c) for c in cs],
                'sourceModifiedAt':stamp(post['modified_gmt'] or post['modified'])}
        if parent: item['subCategorySlug']=category_slug(chosen)
        hero = post.get('featured_media',0)
        if hero in image_ids: item['heroMediaKey']=f'wp-media-{hero}'
        elif hero: unknown_images.append({'postId':post['id'],'missingFeaturedMedia':hero})
        prepared.append(item)
    prepared.sort(key=lambda x:x['publishedAt'],reverse=True)
    if prepared:
        prepared[0]['feature']='lead'
        for p in prepared[1:5]: p['feature']='top'
        dossier=next((p for p in prepared[5:] if p['categorySlug']=='dossier-special'),None)
        if dossier: dossier['feature']='dossier'
    cats=[]
    for c in categories:
        slug=category_slug(c); parent=by_category.get(c['parent'])
        root_slug=category_slug(parent) if parent else slug
        accent={'succes-story':'magenta-600','editorial':'navy-700','espace-pro':'navy-600','tribune':'magenta-600'}.get(root_slug,'navy-900')
        row={'slug':slug,'name':plain(c['name']),'accent':accent,'description':plain(c.get('description','')),
             'order':ORDER.index(slug)+1 if slug in ORDER else c['id'],'isActive':True}
        if parent: row['parentSlug']=category_slug(parent)
        cats.append(row)
    authors=[{'name':u['name'],'slug':'le-corporate' if u['slug']=='admin' else u['slug'],
              'role':'','bio':u.get('description',''),'links':[]} for u in users]
    slug_by_author={u['id']:a['slug'] for u,a in zip(users,authors)}
    for p in prepared:
        original=next(x for x in posts if x['id']==p['wordpressId'])
        p['authorSlug']=slug_by_author[original['author']]
    report={'articles':len(prepared),'categories':len(cats),'authors':len(authors),
            'emptyBodies':[p['wordpressId'] for p in prepared if not p['body']],
            'duplicateSlugs':len(prepared)-len({p['slug'] for p in prepared}),
            'unknownImages':unknown_images,'unsupportedTags':dict(unsupported),'textGaps':text_gaps,
            'unavailableImages':unavailable,
            'longestSlug':max(len(p['slug']) for p in prepared)}
    for name,value in [('prepared-articles',prepared),('prepared-taxonomy',{'categories':cats,'authors':authors}),('conversion-report',report)]:
        (BASE/(name+'.json')).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:v if k not in {'unknownImages','textGaps'} else len(v) for k,v in report.items()},ensure_ascii=False))
    if report['emptyBodies'] or report['duplicateSlugs'] or text_gaps or unknown_images:
        raise SystemExit('Conversion requires review; see conversion-report.json.')

if __name__=='__main__': main()
