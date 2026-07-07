type JsonScalar = string | number | boolean | null;

export type SanitizedMetadataValue =
  | JsonScalar
  | SanitizedMetadataValue[]
  | { [key: string]: SanitizedMetadataValue };

export type SanitizedMetadata = Record<string, SanitizedMetadataValue>;

type MetadataSanitizerOptions = {
  maxDepth: number;
  maxBytes: number;
  maxStringLength: number;
  maxArrayItems: number;
  maxObjectKeys: number;
};

export const TELEMETRY_METADATA_MAX_DEPTH = 5;
export const TELEMETRY_METADATA_MAX_BYTES = 4096;

const DEFAULT_OPTIONS: MetadataSanitizerOptions = {
  maxDepth: TELEMETRY_METADATA_MAX_DEPTH,
  maxBytes: TELEMETRY_METADATA_MAX_BYTES,
  maxStringLength: 256,
  maxArrayItems: 20,
  maxObjectKeys: 40
};

export type MetadataFootprintResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: "metadata_too_large" | "metadata_too_deep";
      maxBytes: number;
      maxDepth: number;
    };

const CONTENT_KEY_PARTS = [
  "prompt",
  "completion",
  "message",
  "content",
  "input",
  "output",
  "source",
  "text",
  "raw",
  "body"
];

const CONTENT_EXACT_KEYS = new Set([
  "code",
  "codes",
  ...CONTENT_KEY_PARTS,
  ...CONTENT_KEY_PARTS.map((key) => `${key}s`)
]);

function normalizeMetadataKey(key: string) {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isContentLikeKey(key: string) {
  const normalized = normalizeMetadataKey(key);
  if (CONTENT_EXACT_KEYS.has(normalized)) return true;
  if (normalized.includes("sourcecode")) return true;

  return CONTENT_KEY_PARTS.some((part) => normalized.includes(part));
}

function byteLength(value: SanitizedMetadata) {
  return Buffer.byteLength(JSON.stringify(value), "utf8");
}

function unknownByteLength(value: unknown) {
  return Buffer.byteLength(JSON.stringify(value), "utf8");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateTelemetryMetadataFootprint(
  metadata: Record<string, unknown> | undefined,
  options: Pick<MetadataSanitizerOptions, "maxBytes" | "maxDepth"> = DEFAULT_OPTIONS
): MetadataFootprintResult {
  if (!metadata) return { ok: true };

  if (unknownByteLength(metadata) > options.maxBytes) {
    return {
      ok: false,
      error: "metadata_too_large",
      maxBytes: options.maxBytes,
      maxDepth: options.maxDepth
    };
  }

  const stack: Array<{ value: unknown; depth: number }> = [
    { value: metadata, depth: 1 }
  ];

  while (stack.length > 0) {
    const item = stack.pop();
    if (!item) continue;

    if (item.depth > options.maxDepth) {
      return {
        ok: false,
        error: "metadata_too_deep",
        maxBytes: options.maxBytes,
        maxDepth: options.maxDepth
      };
    }

    if (Array.isArray(item.value)) {
      for (const nestedValue of item.value) {
        stack.push({ value: nestedValue, depth: item.depth + 1 });
      }
      continue;
    }

    if (isRecord(item.value)) {
      for (const nestedValue of Object.values(item.value)) {
        stack.push({ value: nestedValue, depth: item.depth + 1 });
      }
    }
  }

  return { ok: true };
}

function sanitizeScalar(
  value: unknown,
  options: MetadataSanitizerOptions
): JsonScalar | undefined {
  if (value === null) return null;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string") return value.slice(0, options.maxStringLength);

  return undefined;
}

function sanitizeArray(
  value: unknown[],
  depth: number,
  options: MetadataSanitizerOptions
): SanitizedMetadataValue[] | undefined {
  if (depth >= options.maxDepth) return undefined;

  return value
    .slice(0, options.maxArrayItems)
    .map((item) => sanitizeValue(item, depth + 1, options))
    .filter((item): item is SanitizedMetadataValue => item !== undefined);
}

function sanitizeObject(
  value: Record<string, unknown>,
  depth: number,
  options: MetadataSanitizerOptions
): SanitizedMetadata | undefined {
  if (depth >= options.maxDepth) return undefined;

  const sanitized: SanitizedMetadata = {};
  let keptKeys = 0;

  for (const [key, nestedValue] of Object.entries(value)) {
    const cleanKey = key.trim().slice(0, 80);
    if (!cleanKey || isContentLikeKey(cleanKey)) continue;

    const sanitizedValue = sanitizeValue(nestedValue, depth + 1, options);
    if (sanitizedValue === undefined) continue;

    sanitized[cleanKey] = sanitizedValue;
    keptKeys += 1;

    if (keptKeys >= options.maxObjectKeys) break;
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

function sanitizeValue(
  value: unknown,
  depth: number,
  options: MetadataSanitizerOptions
): SanitizedMetadataValue | undefined {
  const scalar = sanitizeScalar(value, options);
  if (scalar !== undefined) return scalar;

  if (Array.isArray(value)) {
    return sanitizeArray(value, depth, options);
  }

  if (isRecord(value)) {
    return sanitizeObject(value, depth, options);
  }

  return undefined;
}

function enforceMaxBytes(
  metadata: SanitizedMetadata,
  maxBytes: number
): SanitizedMetadata | null {
  if (byteLength(metadata) <= maxBytes) return metadata;

  const compacted: SanitizedMetadata = {};

  for (const [key, value] of Object.entries(metadata)) {
    const next = { ...compacted, [key]: value };
    if (byteLength(next) > maxBytes) continue;
    compacted[key] = value;
  }

  return Object.keys(compacted).length > 0 ? compacted : null;
}

export function sanitizeTelemetryMetadata(
  metadata: Record<string, unknown> | undefined,
  options: Partial<MetadataSanitizerOptions> = {}
) {
  if (!metadata) return null;

  const mergedOptions = {
    ...DEFAULT_OPTIONS,
    ...options
  };
  const sanitized = sanitizeObject(metadata, 0, mergedOptions);

  if (!sanitized) return null;

  return enforceMaxBytes(sanitized, mergedOptions.maxBytes);
}
