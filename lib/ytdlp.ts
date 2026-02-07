import ytdl, { createAgent, Cookie } from "@distube/ytdl-core";

export interface VideoInfo {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  duration_string: string;
  url: string;
}

function extractVideoId(url: string): string {
  const urlObj = new URL(url);
  if (urlObj.hostname.includes("youtu.be")) {
    return urlObj.pathname.slice(1);
  }
  return urlObj.searchParams.get("v") || "";
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getAgent() {
  const raw = process.env.YOUTUBE_COOKIES;
  if (!raw) return undefined;
  try {
    const cookies: Cookie[] = JSON.parse(
      Buffer.from(raw, "base64").toString("utf-8")
    );
    return createAgent(cookies);
  } catch {
    return undefined;
  }
}

export async function getVideoInfo(url: string): Promise<VideoInfo> {
  // oEmbed works without cookies, always reliable
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  const res = await fetch(oembedUrl);

  if (!res.ok) {
    throw new Error("Failed to fetch video info");
  }

  const data = await res.json();
  const videoId = extractVideoId(url);

  // Try to get duration from ytdl-core (optional, won't break if it fails)
  let duration = 0;
  let duration_string = "";
  try {
    const agent = getAgent();
    const info = await ytdl.getBasicInfo(url, { agent });
    duration = parseInt(info.videoDetails.lengthSeconds) || 0;
    duration_string = formatDuration(duration);
  } catch {
    // Duration is optional, oEmbed doesn't provide it
  }

  return {
    id: videoId,
    title: data.title,
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    duration,
    duration_string,
    url,
  };
}

export async function getDownloadUrl(
  url: string,
  format: "mp4" | "mp3"
): Promise<string> {
  const agent = getAgent();
  const info = await ytdl.getInfo(url, { agent });

  const selected =
    format === "mp3"
      ? ytdl.chooseFormat(info.formats, {
          filter: "audioonly",
          quality: "highestaudio",
        })
      : ytdl.chooseFormat(info.formats, {
          filter: "audioandvideo",
          quality: "highest",
        });

  return selected.url;
}
