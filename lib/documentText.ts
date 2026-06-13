import "server-only";

/** File types we can read text out of for question import and study extraction. */
export const ACCEPTED_DOC_EXTENSIONS = ["pdf", "docx", "txt", "md"] as const;

/** Documents larger than this are almost certainly not research briefs. */
export const MAX_DOC_BYTES = 10 * 1024 * 1024;

export function documentExtension(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

export function isAcceptedDocument(name: string): boolean {
  return ACCEPTED_DOC_EXTENSIONS.includes(documentExtension(name) as never);
}

/**
 * Pull plain text out of an uploaded document. PDFs go through unpdf,
 * Word files through mammoth, and text/markdown are read directly. Throws
 * if the underlying parser fails so callers can return a 502.
 */
export async function extractDocumentText(file: File): Promise<string> {
  const extension = documentExtension(file.name);

  if (extension === "pdf") {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(await file.arrayBuffer()));
    const result = await extractText(pdf, { mergePages: false });
    // Page-per-entry keeps line structure better than one merged string.
    return (result.text as string[]).join("\n");
  }

  if (extension === "docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({
      buffer: Buffer.from(await file.arrayBuffer()),
    });
    return result.value;
  }

  return file.text();
}
