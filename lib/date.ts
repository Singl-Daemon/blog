const DATE_LOCALE = "zh-CN";

export function formatDateLong(date: string) {
  return new Date(date).toLocaleDateString(DATE_LOCALE, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateCompact(date: string) {
  return new Date(date).toLocaleDateString(DATE_LOCALE, {
    month: "2-digit",
    day: "2-digit",
  });
}
