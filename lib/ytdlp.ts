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

export async function getVideoInfo(url: string): Promise<VideoInfo> {
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  const res = await fetch(oembedUrl);

  if (!res.ok) {
    throw new Error("Failed to fetch video info");
  }

  const data = await res.json();
  const videoId = extractVideoId(url);

  return {
    id: videoId,
    title: data.title,
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    duration: 0,
    duration_string: "",
    url,
  };
}

export async function getDownloadUrl(
  url: string,
  format: "mp4" | "mp3"
): Promise<string> {
  const body =
    format === "mp3"
      ? { url, downloadMode: "audio", audioFormat: "mp3" }
      : { url, videoQuality: "1080" };

  const res = await fetch("https://api.cobalt.tools/", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Download service unavailable");
  }

  const data = await res.json();

  if (data.status === "error") {
    throw new Error(data.error?.code || "Download failed");
  }

  return data.url;
}
