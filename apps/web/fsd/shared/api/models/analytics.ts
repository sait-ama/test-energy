export interface SaveUserUrchinTrackingModuleRequestSchema {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content?: string;
  utm_term?: string;
}

export type SaveUserUrchinTrackingModuleResponseSchema = void;

interface RenderEvent {
  operation: 'render';
  target: number[];
}

interface ClickEvent {
  operation: 'click';
  target: number;
}

export type CreateAdvertisementActionRequestSchema = RenderEvent | ClickEvent;
export type CreateAdvertisementActionResponseSchema = void;
