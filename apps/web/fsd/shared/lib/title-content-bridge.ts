import type { TitleSchema } from '~shared/api/models/title';

type BridgeReturnType = (
  | TitleSchema
  | {
      title: TitleSchema;
    }
)[];

export function getListContentBridge(data): BridgeReturnType {
  if (typeof data !== 'object') {
    throw new Error('Invalid data');
  }

  if (!data) {
    return [];
  }

  if (Array.isArray(data)) {
    return data;
  }

  if (data.titles) {
    return data.titles;
  }

  if (data.content) {
    return data.content;
  }

  return [];
}

export function getTitleContentBridge(data): TitleSchema {
  if (data.title) {
    return data.title;
  }

  return data;
}
