import { getDocuments } from "@/lib/content/server";

/** Stable local links to migrated PDFs; the bytes live in Convex storage. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  if (!/^wordpress-\d+\.pdf$/.test(file))
    return new Response(null, { status: 404 });
  const document = (await getDocuments()).find(
    (item) => `${item.slug}.pdf` === file
  );
  if (!document) return new Response(null, { status: 404 });
  return Response.redirect(document.fileUrl, 307);
}
