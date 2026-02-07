"use client";

import { useState } from "react";

interface BulkAddFormProps {
  onAddAll: (urls: string[]) => void;
}

export default function BulkAddForm({ onAddAll }: BulkAddFormProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const urls = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    if (urls.length > 0) {
      onAddAll(urls);
      setText("");
    }
  };

  const lineCount = text
    .split("\n")
    .filter((line) => line.trim().length > 0).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={"Paste multiple YouTube URLs (one per line)...\nhttps://youtube.com/watch?v=...\nhttps://youtube.com/watch?v=..."}
        rows={4}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors resize-y"
      />
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">
          {lineCount > 0 ? `${lineCount} URL${lineCount > 1 ? "s" : ""}` : ""}
        </span>
        <button
          type="submit"
          disabled={lineCount === 0}
          className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Add All
        </button>
      </div>
    </form>
  );
}
