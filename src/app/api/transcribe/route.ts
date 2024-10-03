import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  console.log("File type:", file.type);
  console.log("File size:", file.size);

  try {
    const response = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      language: "fr", 
      response_format: "text", 
    });

    return NextResponse.json({ text: response });
  } catch (error) {
    console.error("Error transcribing audio:", error);
    return NextResponse.json(
      { error: "Error transcribing audio", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}