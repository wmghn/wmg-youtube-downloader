import ytdl from "@distube/ytdl-core";
import { Readable } from "stream";

export interface VideoInfo {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  duration_string: string;
  url: string;
}

export async function getVideoInfo(url: string): Promise<VideoInfo> {
  const info = await ytdl.getBasicInfo(url);
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
  if (format === "mp3") {
    const stream = ytdl(url, {
      filter: "audioonly",
      quality: "highestaudio",
    });
    return { stream, contentType: "audio/mpeg" };
  }

  const stream = ytdl(url, {
    filter: "audioandvideo",
    quality: "highest",
  });
  return { stream, contentType: "video/mp4" };
}
