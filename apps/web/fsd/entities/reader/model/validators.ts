import { z } from 'zod';

import { HotkeyAction } from '~entities/reader/model/const';

export const ReaderSettingsValidator = z.object({
  novel: z.object({
    fontSize: z.number(),
    lineHeight: z.number(),
  }),
  manga: z.object({
    imageServer: z.number(),
    readerType: z.enum(['slider', 'pager']),
    clickableAreaId: z.number(),
    imageFit: z.enum(['width', 'height']),
    zoom: z.boolean(),
    clickableAreaZone: z.enum(['page', 'full']),
    pageIndicator: z.boolean(),
    gapBetweenItems: z.number(),
    notes: z.boolean(),
  }),
  common: z.object({
    hidePageIndex: z.boolean(),
    brightness: z.number(),
    hotkeys: z.record(z.nativeEnum(HotkeyAction), z.array(z.string())),
    containerWidth: z.number(),
    autoLoad: z.boolean(),
    tapToScroll: z.boolean(),
    tapToScrollSize: z.number(),
    autoScrollSize: z.number(),
    backActionStrategyId: z.number(),
  }),
});

export type ReaderSettingsSchema = z.infer<typeof ReaderSettingsValidator>;
