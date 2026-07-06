"use client";

import { Bookmark } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type SaveButtonProps = {
  contentId: string;
  className?: string;
};

export function SaveButton({ contentId, className }: SaveButtonProps) {
  const { data: session, status } = useSession();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;

    async function checkSaved() {
      const response = await fetch(`/api/user/saved/${contentId}`);
      const data = await response.json();
      setSaved(Boolean(data.saved));
    }

    void checkSaved();
  }, [contentId, status]);

  if (status === "unauthenticated") return null;
  if (status === "loading") return null;

  async function toggleSave() {
    if (!session) return;
    setLoading(true);

    const response = saved
      ? await fetch(`/api/user/saved/${contentId}`, { method: "DELETE" })
      : await fetch("/api/user/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentId }),
        });

    setLoading(false);

    if (response.ok) {
      setSaved(!saved);
    }
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={loading}
      onClick={toggleSave}
      className={cn(saved && "border-gold-brand text-gold-brand", className)}
    >
      <Bookmark size={16} className={cn("ml-1", saved && "fill-current")} />
      {loading ? "..." : saved ? "ذخیره شده" : "ذخیره در کتابخانه"}
    </Button>
  );
}
