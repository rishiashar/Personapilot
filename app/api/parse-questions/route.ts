import { NextResponse } from "next/server";

import {
  extractDocumentText,
  isAcceptedDocument,
  MAX_DOC_BYTES,
} from "@/lib/documentText";

export const runtime = "nodejs";

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
  if (file.size > MAX_DOC_BYTES) {
    return NextResponse.json(
      { error: "File is too large. Keep it under 10 MB." },
      { status: 413 }
    );
  }

  if (!isAcceptedDocument(file.name)) {
    return NextResponse.json(
      { error: "Unsupported file type. Use PDF, DOCX, TXT, or Markdown." },
      { status: 415 }
    );
  }

  try {
    const text = await extractDocumentText(file);

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
