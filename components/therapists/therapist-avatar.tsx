import { arMessages } from "@/lib/config/messages/ar";

type TherapistAvatarProps = {
  fullName: string;
  profileImageUrl: string | null;
  alt: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-14 w-14 text-lg",
  md: "h-16 w-16 text-xl",
  lg: "h-24 w-24 text-2xl",
} as const;

function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("");
}

export function TherapistAvatar({
  fullName,
  profileImageUrl,
  alt,
  size = "md",
}: TherapistAvatarProps) {
  const sizeClass = sizeClasses[size];

  if (profileImageUrl) {
    return (
      <div className={`${sizeClass} overflow-hidden rounded-3xl bg-emerald-100`}>
        <img src={profileImageUrl} alt={alt} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} flex items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-100 via-cyan-50 to-white font-semibold text-emerald-900 shadow-inner`}
      aria-label={arMessages.therapists.browse.fallbackAvatarLabel}
    >
      {getInitials(fullName)}
    </div>
  );
}
