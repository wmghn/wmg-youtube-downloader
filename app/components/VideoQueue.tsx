"use client";

import VideoItem, { VideoEntry } from "./VideoItem";

interface VideoQueueProps {
  videos: VideoEntry[];
  onFormatChange: (id: string, format: "mp4" | "mp3") => void;
  onDownload: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function VideoQueue({
  videos,
  onFormatChange,
  onDownload,
  onRemove,
}: VideoQueueProps) {
  if (videos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-700 py-16 text-center">
        <svg
          className="mx-auto h-12 w-12 text-zinc-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <p className="mt-4 text-zinc-400">No videos in queue</p>
        <p className="text-sm text-zinc-500">
          Add YouTube URLs above to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Queue ({videos.length})
        </h2>
      </div>
      <div className="space-y-2">
        {videos.map((video) => (
          <VideoItem
            key={video.id}
            video={video}
            onFormatChange={onFormatChange}
            onDownload={onDownload}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}
