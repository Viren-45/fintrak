// src/hooks/useAvatarUpload.ts
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// Converts the cropped <canvas> to a WebP Blob
function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to convert canvas to blob"));
      },
      "image/webp",
      0.9, // 90% quality — good balance of size vs clarity for an avatar
    );
  });
}

export function useAvatarUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function uploadAvatar(canvas: HTMLCanvasElement): Promise<string> {
    setIsUploading(true);
    setUploadError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const blob = await canvasToBlob(canvas);

      // Always overwrite the same path — no orphaned files ever
      const filePath = `${user.id}/avatar.webp`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, blob, {
          upsert: true,
          contentType: "image/webp",
        });

      if (uploadError) throw uploadError;

      // Get the public URL — bucket is public so no expiry needed
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // Bust the browser cache so the new avatar shows immediately
      return `${data.publicUrl}?t=${Date.now()}`;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Upload failed. Please try again.";
      setUploadError(message);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }

  async function removeAvatar(): Promise<void> {
    setIsUploading(true);
    setUploadError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.storage
        .from("avatars")
        .remove([`${user.id}/avatar.webp`]);

      if (error) throw error;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Remove failed. Please try again.";
      setUploadError(message);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }

  return { uploadAvatar, removeAvatar, isUploading, uploadError };
}
