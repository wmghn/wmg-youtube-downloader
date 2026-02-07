"use client";

import { useState } from "react";

interface AddVideoFormProps {
  onAdd: (url: string) => void;
}

export default function AddVideoForm({ onAdd }: AddVideoFormProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (trimmed) {
      onAdd(trimmed);
      setUrl("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste a YouTube URL..."
        className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
      />
      <button
        type="submit"
        disabled={!url.trim()}
        className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Add
      </button>
    </form>
  );
}
