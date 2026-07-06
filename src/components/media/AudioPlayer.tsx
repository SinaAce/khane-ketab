"use client";

import { ExternalLink, Pause, Play } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatDuration, isArchiveFileKey } from "@/lib/utils";

type AudioPlayerProps = {
  src: string;
  title: string;
  fileKey?: string;
};

export function AudioPlayer({ src, title, fileKey }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");

  const isArchive = fileKey ? isArchiveFileKey(fileKey) : src.includes("archive.org/embed");

  if (isArchive) {
    const archiveId = fileKey ? fileKey.replace("archive:", "") : "";
    const embedUrl = archiveId ? `https://archive.org/embed/${archiveId}` : src;
    const detailsUrl = archiveId ? `https://archive.org/details/${archiveId}` : src;

    return (
      <div className="surface-panel rounded-2xl bg-gradient-to-l from-surface-muted to-surface p-6">
        <p className="mb-4 text-lg font-semibold text-foreground">{title}</p>
        <div className="overflow-hidden rounded-xl border border-border-persian">
          <iframe
            src={embedUrl}
            title={title}
            className="h-44 w-full bg-surface-muted"
            allow="autoplay"
            loading="lazy"
          />
        </div>
        <div className="mt-4 text-center">
          <a
            href={detailsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-teal-brand hover:underline"
          >
            <ExternalLink size={14} />
            پخش در آرشیو اینترنت
          </a>
        </div>
      </div>
    );
  }

  async function togglePlay() {
    const audio = audioRef.current;
    if (!audio || error) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setError("فایل صوتی در دسترس نیست.");
      setPlaying(false);
    }
  }

  return (
    <div className="surface-panel rounded-2xl bg-gradient-to-l from-surface-muted to-surface p-6">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration);
          setError("");
        }}
        onEnded={() => setPlaying(false)}
        onError={() => setError("فایل صوتی در دسترس نیست.")}
      />

      <div className="mb-4">
        <p className="text-lg font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted">
          {error ||
            `${formatDuration(Math.floor(currentTime))} / ${formatDuration(Math.floor(duration))}`}
        </p>
      </div>

      {!error && (
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={(event) => {
            const value = Number(event.target.value);
            setCurrentTime(value);
            if (audioRef.current) audioRef.current.currentTime = value;
          }}
          className="mb-4 w-full accent-teal-brand"
        />
      )}

      <Button onClick={togglePlay} disabled={Boolean(error)}>
        {playing ? <Pause size={18} className="ml-2" /> : <Play size={18} className="ml-2" />}
        {error ? "غیرقابل پخش" : playing ? "توقف" : "پخش"}
      </Button>
    </div>
  );
}
