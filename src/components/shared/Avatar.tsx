// src/components/shared/Avatar.tsx

"use client";

// Derives initials from a display name.
// "Virendra Purohit" → "VP", "Viren" → "V", "" → "?"
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface AvatarProps {
  name: string;
  avatarUrl: string | null;
  size?: number; // pixel size, default 36
}

export default function Avatar({ name, avatarUrl, size = 36 }: AvatarProps) {
  const initials = getInitials(name);

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="rounded-full object-cover shrink-0"
      />
    );
  }

  // Initials fallback
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: "#3B82F6",
        fontSize: size * 0.36,
      }}
      className="rounded-full flex items-center justify-center shrink-0 select-none"
    >
      <span className="text-white font-semibold leading-none">{initials}</span>
    </div>
  );
}
