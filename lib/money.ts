export function toNumber(value: unknown): number {
  if (value == null) return 0;

  const numeric =
    typeof value === "object" && "toNumber" in value
      ? Number((value as { toNumber: () => number }).toNumber())
      : Number(value);

  return Number.isFinite(numeric) ? numeric : 0;
}

export function usd(value: unknown, maximumFractionDigits = 4): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits
  }).format(toNumber(value));
}

export function compactNumber(value: unknown): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(toNumber(value));
}

export function percent(numerator: unknown, denominator: unknown): number {
  const top = toNumber(numerator);
  const bottom = toNumber(denominator);

  if (bottom <= 0) return 0;
  return Math.min(100, Math.max(0, (top / bottom) * 100));
}
