import { NextRequest, NextResponse } from "next/server";
import { getVideoInfo } from "@/lib/ytdlp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const urls: string[] = body.urls;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "Please provide an array of URLs" },
        { status: 400 }
      );
    }

    const results = await Promise.allSettled(urls.map((url) => getVideoInfo(url)));

    const videos = results.map((result, index) => {
      if (result.status === "fulfilled") {
        return { success: true, data: result.value };
      }
      return {
        success: false,
        url: urls[index],
        error: result.reason?.message || "Unknown error",
      };
    });

    return NextResponse.json({ videos });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
