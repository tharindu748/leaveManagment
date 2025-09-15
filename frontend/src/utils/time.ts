// utils/time.ts
export function formatSeconds(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0h";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  let formatted = "";
  if (hours > 0) formatted += `${hours}h`;
  if (minutes > 0) formatted += ` ${minutes}min`;

  return formatted.trim() || "0h";
}
