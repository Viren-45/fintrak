"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, {
  type Crop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { useSettings } from "@/hooks/useSettings";
import Avatar from "@/components/shared/Avatar";
import { Camera, Trash2, Loader2 } from "lucide-react";

// Starts with a centered square crop at 90% of the image
function centeredCrop(width: number, height: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, 1, width, height),
    width,
    height,
  );
}

// Draws the cropped region onto a 300×300 canvas
function cropImageToCanvas(
  image: HTMLImageElement,
  crop: Crop,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const OUTPUT_SIZE = 300; // fixed output size for all avatars
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE,
  );

  return canvas;
}

export default function AvatarUpload() {
  const { settings, saveAvatarUrl } = useSettings();
  const { uploadAvatar, removeAvatar, isUploading, uploadError } =
    useAvatarUpload();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [isRemoving, setIsRemoving] = useState(false);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // When user picks a file, read it as a data URL and open the dialog
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be re-selected after cancel
    e.target.value = "";

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setCrop(undefined); // reset crop so centeredCrop fires on load
      setDialogOpen(true);
    };
    reader.readAsDataURL(file);
  }

  // Set initial crop once the image element loads inside the dialog
  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      setCrop(centeredCrop(width, height));
    },
    [],
  );

  async function handleSave() {
    if (!imageRef.current || !crop) return;

    try {
      const canvas = cropImageToCanvas(imageRef.current, crop);
      const publicUrl = await uploadAvatar(canvas);
      await saveAvatarUrl(publicUrl);
      setDialogOpen(false);
      setImageSrc(null);
    } catch {
      // uploadError state is already set inside useAvatarUpload
    }
  }

  async function handleRemove() {
    setIsRemoving(true);
    try {
      await removeAvatar();
      await saveAvatarUrl(null);
    } catch {
      // silent — remove is best-effort
    } finally {
      setIsRemoving(false);
    }
  }

  const busy = isUploading || isRemoving;

  return (
    <div className="flex items-center gap-4">
      {/* Current avatar preview */}
      <Avatar
        name={settings.userName}
        avatarUrl={settings.avatarUrl}
        size={64}
      />

      <div className="flex flex-col gap-2">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors duration-150 disabled:opacity-50"
          style={{
            borderColor: "#E2E8F0",
            color: "#0F172A",
            backgroundColor: "#FFFFFF",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#F1F5F9";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#FFFFFF";
          }}
        >
          <Camera size={15} strokeWidth={1.8} />
          {settings.avatarUrl ? "Change photo" : "Upload photo"}
        </button>

        {/* Only show remove if there's a custom photo */}
        {settings.avatarUrl && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={busy}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors duration-150 disabled:opacity-50"
            style={{
              borderColor: "#FEE2E2",
              color: "#EF4444",
              backgroundColor: "#FFFFFF",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#FEF2F2";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#FFFFFF";
            }}
          >
            {isRemoving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Trash2 size={15} strokeWidth={1.8} />
            )}
            Remove photo
          </button>
        )}
      </div>

      {/* Crop dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: "#0F172A" }}>
              Crop your photo
            </DialogTitle>
          </DialogHeader>

          {imageSrc && (
            <div className="flex flex-col gap-4">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                aspect={1}
                circularCrop
                className="max-h-80 overflow-hidden rounded-lg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  className="max-w-full"
                />
              </ReactCrop>

              {uploadError && (
                <p className="text-sm" style={{ color: "#EF4444" }}>
                  {uploadError}
                </p>
              )}

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setDialogOpen(false);
                    setImageSrc(null);
                  }}
                  disabled={busy}
                  className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors duration-150 disabled:opacity-50"
                  style={{
                    borderColor: "#E2E8F0",
                    color: "#64748B",
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={busy}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 disabled:opacity-50"
                  style={{
                    backgroundColor: "#3B82F6",
                    color: "#FFFFFF",
                  }}
                >
                  {isUploading && (
                    <Loader2 size={15} className="animate-spin" />
                  )}
                  Save photo
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
