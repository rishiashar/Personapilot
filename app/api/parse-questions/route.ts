import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Documents larger than this are almost certainly not interview guides.
const MAX_FILE_BYTES = 10 * 1024 * 1024;

const ACCEPTED_EXTENSIONS = ["pdf", "docx", "txt", "md"] as const;

function extensionOf(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

/**
 * Turn raw document text into one question per line: strips numbering and
 * bullet prefixes, drops empties, and keeps order.
 */
function toQuestionLines(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) =>
      line
        .replace(/^\s*(?:[-*•–·]|\(?\d+[.)]?|Q\d+[:.)]?)\s*/i, "")
        .trim()
    )
    .filter((line) => line.length > 2);
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart form data with a document file." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "A document file is required." },
      { status: 400 }
    );
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "File is too large. Keep it under 10 MB." },
      { status: 413 }
    );
  }

  const extension = extensionOf(file.name);
  if (!ACCEPTED_EXTENSIONS.includes(extension as never)) {
    return NextResponse.json(
      { error: "Unsupported file type. Use PDF, DOCX, TXT, or Markdown." },
      { status: 415 }
    );
  }

  try {
    let text = "";
    if (extension === "pdf") {
      const { extractText, getDocumentProxy } = await import("unpdf");
      const pdf = await getDocumentProxy(new Uint8Array(await file.arrayBuffer()));
      const result = await extractText(pdf, { mergePages: false });
      // Page-per-entry keeps line structure better than one merged string.
      text = (result.text as string[]).join("\n");
    } else if (extension === "docx") {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({
        buffer: Buffer.from(await file.arrayBuffer()),
      });
      text = result.value;
    } else {
      text = await file.text();
    }

    const questions = toQuestionLines(text);
    if (questions.length === 0) {
      return NextResponse.json(
        { error: "No readable text found in that document." },
        { status: 422 }
      );
    }
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("parse-questions error:", error);
    return NextResponse.json(
      { error: "Could not read that document." },
      { status: 502 }
    );
  }
}
