"use client";

export type VideoStatus = "pending" | "fetching" | "ready" | "downloading" | "done" | "error";

export interface VideoEntry {
  id: string;
  url: string;
  title?: string;
  thumbnail?: string;
  duration_string?: string;
  format: "mp4" | "mp3";
  status: VideoStatus;
  error?: string;
}

interface VideoItemProps {
  video: VideoEntry;
  onFormatChange: (id: string, format: "mp4" | "mp3") => void;
  onDownload: (id: string) => void;
  onRemove: (id: string) => void;
}

const statusConfig: Record<VideoStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "text-zinc-400" },
  fetching: { label: "Fetching info...", color: "text-yellow-400" },
  ready: { label: "Ready", color: "text-green-400" },
  downloading: { label: "Downloading...", color: "text-blue-400" },
  done: { label: "Done", color: "text-emerald-400" },
  error: { label: "Error", color: "text-red-400" },
};

export default function VideoItem({
  video,
  onFormatChange,
  onDownload,
  onRemove,
}: VideoItemProps) {
  const status = statusConfig[video.status];

  return (
    <div className="flex items-center gap-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
      {/* Thumbnail */}
      <div className="h-20 w-36 flex-shrink-0 overflow-hidden rounded-md bg-zinc-700">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title || "Video thumbnail"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-500">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-medium text-white">
          {video.title || video.url}
        </h3>
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block truncate text-sm text-zinc-400 hover:text-red-400 transition-colors"
        >
          {video.url}
        </a>
        {video.duration_string && (
          <p className="text-sm text-zinc-400">{video.duration_string}</p>
        )}
        <p className={`text-sm font-medium ${status.color}`}>
          {video.status === "error" && video.error
            ? `Error: ${video.error}`
            : status.label}
        </p>
      </div>

      {/* Format selector */}
      <div className="flex-shrink-0">
        <select
          value={video.format}
          onChange={(e) =>
            onFormatChange(video.id, e.target.value as "mp4" | "mp3")
          }
          disabled={video.status === "downloading"}
          className="rounded-md border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm text-white outline-none focus:border-red-500 disabled:opacity-50"
        >
          <option value="mp4">MP4</option>
          <option value="mp3">MP3</option>
        </select>
      </div>

      {/* Download button */}
      <button
        onClick={() => onDownload(video.id)}
        disabled={
          video.status === "fetching" ||
          video.status === "downloading" ||
          video.status === "pending"
        }
        className="flex-shrink-0 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {video.status === "downloading" ? (
          <span className="flex items-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Downloading
          </span>
        ) : video.status === "done" ? (
          "Re-download"
        ) : (
          "Download"
        )}
      </button>

      {/* Remove button */}
      <button
        onClick={() => onRemove(video.id)}
        disabled={video.status === "downloading"}
        className="flex-shrink-0 rounded-md p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 disabled:opacity-40 transition-colors"
        title="Remove"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
