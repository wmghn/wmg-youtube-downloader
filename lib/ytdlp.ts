import ytdl, { createAgent, Cookie } from "@distube/ytdl-core";
import { Readable } from "stream";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

export interface VideoInfo {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  duration_string: string;
  url: string;
}

function getAgent() {
  const cookiesPath = join(process.cwd(), "cookies.json");
  if (existsSync(cookiesPath)) {
    const cookies: Cookie[] = JSON.parse(readFileSync(cookiesPath, "utf-8"));
    return createAgent(cookies);
  }
  return undefined;
}

export async function getVideoInfo(url: string): Promise<VideoInfo> {
  const agent = getAgent();
  const info = await ytdl.getBasicInfo(url, { agent });
  const details = info.videoDetails;
  const duration = parseInt(details.lengthSeconds) || 0;
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  return {
    id: details.videoId,
    title: details.title,
    thumbnail:
      details.thumbnails[details.thumbnails.length - 1]?.url || "",
    duration,
    duration_string: `${minutes}:${seconds.toString().padStart(2, "0")}`,
    url,
  };
}

export function getDownloadStream(
  url: string,
  format: "mp4" | "mp3"
): { stream: Readable; contentType: string } {
  const agent = getAgent();

  if (format === "mp3") {
    const stream = ytdl(url, {
      agent,
      filter: "audioonly",
      quality: "highestaudio",
    });
    return { stream, contentType: "audio/mpeg" };
  }

  const stream = ytdl(url, {
    agent,
    filter: "audioandvideo",
    quality: "highest",
  });
  return { stream, contentType: "video/mp4" };
}
