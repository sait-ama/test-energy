export type GenerateArcImageResponseSchema = Blob;
export interface GenerateArcImageRequestSchema {
  images: string[];
  isPlaceholder?: boolean;
}
