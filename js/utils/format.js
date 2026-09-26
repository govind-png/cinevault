export function getYear(dateString) {
  return dateString ? dateString.slice(0, 4) : "—";
}

export function formatRating(rating) {
  return rating ? rating.toFixed(1) : "N/A";
}