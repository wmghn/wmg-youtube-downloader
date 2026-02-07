import { NextRequest } from "next/server";
import { getVideoInfo, getDownloadStream } from "@/lib/ytdlp";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  const format = request.nextUrl.searchParams.get("format") as
    | "mp4"
    | "mp3";

  if (!url) {
    return new Response("Missing url parameter", { status: 400 });
  }

  if (!format || !["mp4", "mp3"].includes(format)) {
    return new Response("Invalid format. Use mp4 or mp3", { status: 400 });
  }

  try {
    const info = await getVideoInfo(url);
    const safeTitle = info.title.replace(/[^a-zA-Z0-9_\- ]/g, "").trim();
    const filename = `${safeTitle}.${format}`;

    const { stream, contentType } = getDownloadStream(url, format);

    let closed = false;

    const readableStream = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk: Buffer) => {
          if (!closed) controller.enqueue(new Uint8Array(chunk));
        });

        stream.on("end", () => {
          if (!closed) {
            closed = true;
            controller.close();
          }
        });

        stream.on("error", (err) => {
          if (!closed) {
            closed = true;
            controller.error(err);
          }
        });
      },
      cancel() {
        stream.destroy();
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Download failed";
    return new Response(message, { status: 500 });
  }
}
