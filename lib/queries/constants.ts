export const MODEL_TYPE_LOCAL = "LOCAL";
export const MODEL_TYPE_CLOUD = "CLOUD";
export const TAG_WINDOW_HOURS = 24;

export type ModelTypeValue =
  | typeof MODEL_TYPE_LOCAL
  | typeof MODEL_TYPE_CLOUD;
