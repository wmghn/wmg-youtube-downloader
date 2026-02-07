"use client";

import { useState, useCallback, useRef } from "react";
import AddVideoForm from "./components/AddVideoForm";
import BulkAddForm from "./components/BulkAddForm";
import VideoQueue from "./components/VideoQueue";
import { VideoEntry } from "./components/VideoItem";

type InputMode = "single" | "bulk";

export default function Home() {
  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const [inputMode, setInputMode] = useState<InputMode>("single");
  const videosRef = useRef(videos);
  videosRef.current = videos;

  const generateId = () => crypto.randomUUID();

  const fetchInfo = useCallback(async (entries: VideoEntry[]) => {
    const urls = entries.map((e) => e.url);

    setVideos((prev) =>
      prev.map((v) =>
        entries.find((e) => e.id === v.id)
          ? { ...v, status: "fetching" as const }
          : v
      )
    );

    try {
      const res = await fetch("/api/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
      });

      if (!res.ok) throw new Error("Failed to fetch info");

      const data = await res.json();

      setVideos((prev) =>
        prev.map((v) => {
          const idx = entries.findIndex((e) => e.id === v.id);
          if (idx === -1) return v;

          const result = data.videos[idx];
          if (result.success) {
            return {
              ...v,
              title: result.data.title,
              thumbnail: result.data.thumbnail,
              duration_string: result.data.duration_string,
              status: "ready" as const,
            };
          }
          return {
            ...v,
            status: "error" as const,
            error: result.error,
          };
        })
      );
    } catch {
      setVideos((prev) =>
        prev.map((v) =>
          entries.find((e) => e.id === v.id)
            ? { ...v, status: "error" as const, error: "Failed to fetch info" }
            : v
        )
      );
    }
  }, []);

  const addUrls = useCallback(
    (urls: string[]) => {
      const newEntries: VideoEntry[] = urls.map((url) => ({
        id: generateId(),
        url,
        format: "mp4",
        status: "pending",
      }));

      setVideos((prev) => [...prev, ...newEntries]);
      fetchInfo(newEntries);
    },
    [fetchInfo]
  );

  const handleAddSingle = useCallback(
    (url: string) => {
      addUrls([url]);
    },
    [addUrls]
  );

  const handleFormatChange = useCallback(
    (id: string, format: "mp4" | "mp3") => {
      setVideos((prev) =>
        prev.map((v) => (v.id === id ? { ...v, format } : v))
      );
    },
    []
  );

  const handleDownload = useCallback(async (id: string) => {
    const video = videosRef.current.find((v) => v.id === id);
    if (!video) return;

    setVideos((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, status: "downloading" as const } : v
      )
    );

    try {
      const params = new URLSearchParams({
        url: video.url,
        format: video.format,
      });

      const res = await fetch(`/api/download?${params.toString()}`);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Download failed");
      }

      const blob = await res.blob();
      const downloadUrl = URL.createObjectURL(blob);

      const safeTitle = (video.title || "video")
        .replace(/[^a-zA-Z0-9_\- ]/g, "")
        .trim();

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${safeTitle}.${video.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      setVideos((prev) =>
        prev.map((v) =>
          v.id === id ? { ...v, status: "done" as const } : v
        )
      );
    } catch (err) {
      setVideos((prev) =>
        prev.map((v) =>
          v.id === id
            ? {
                ...v,
                status: "error" as const,
                error:
                  err instanceof Error ? err.message : "Download failed",
              }
            : v
        )
      );
    }
  }, []);

  const handleRemove = useCallback((id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
  }, []);

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          YouTube Multi-Video Downloader
        </h1>
        <p className="mt-3 text-zinc-400">
          Download multiple YouTube videos as MP4 or MP3
        </p>
      </div>

      {/* Input section */}
      <div className="mb-8 rounded-xl border border-zinc-700 bg-zinc-800/30 p-6">
        {/* Mode toggle */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setInputMode("single")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              inputMode === "single"
                ? "bg-red-600 text-white"
                : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
            }`}
          >
            Single URL
          </button>
          <button
            onClick={() => setInputMode("bulk")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              inputMode === "bulk"
                ? "bg-red-600 text-white"
                : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
            }`}
          >
            Bulk Paste
          </button>
        </div>

        {inputMode === "single" ? (
          <AddVideoForm onAdd={handleAddSingle} />
        ) : (
          <BulkAddForm onAddAll={addUrls} />
        )}
      </div>

      {/* Queue */}
      <VideoQueue
        videos={videos}
        onFormatChange={handleFormatChange}
        onDownload={handleDownload}
        onRemove={handleRemove}
      />
    </main>
  );
}
