const DATE_LOCALE = "zh-CN";

function parseDate(date: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(date);
}

export function formatDateLong(date: string) {
  return parseDate(date).toLocaleDateString(DATE_LOCALE, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateCompact(date: string) {
  return parseDate(date).toLocaleDateString(DATE_LOCALE, {
    month: "2-digit",
    day: "2-digit",
  });
}
