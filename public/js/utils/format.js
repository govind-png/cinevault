export function getYear(dateString) {
  return dateString ? dateString.slice(0, 4) : "—";
}

export function formatRating(rating) {
  return rating ? rating.toFixed(1) : "N/A";
}
export function formatRuntime(minutes) {
  if (!minutes) return "N/A";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours ? `${hours}h ${mins}m` : `${mins}m`;
}
