import { NextRequest, NextResponse } from "next/server";
import { getDownloadUrl } from "@/lib/ytdlp";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  const format = request.nextUrl.searchParams.get("format") as
    | "mp4"
    | "mp3";

  if (!url) {
    return NextResponse.json(
      { error: "Missing url parameter" },
      { status: 400 }
    );
  }

  if (!format || !["mp4", "mp3"].includes(format)) {
    return NextResponse.json(
      { error: "Invalid format. Use mp4 or mp3" },
      { status: 400 }
    );
  }

  try {
    const downloadUrl = await getDownloadUrl(url, format);
    return NextResponse.json({ url: downloadUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Download failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
