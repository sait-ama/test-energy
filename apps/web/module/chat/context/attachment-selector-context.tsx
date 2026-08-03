import { createContext } from '@re/core/utils/create-context';

export type AttachmentSelectorContextValue = {
  fileInput: HTMLInputElement | null;
};

export const {
  useStore: useAttachmentSelectorContext,
  Provider: AttachmentSelectorContextProvider,
  Context: AttachmentSelectorContext,
} = createContext<AttachmentSelectorContextValue, AttachmentSelectorContextValue>(
  (v) => v,
  'AttachmentSelectorContext'
);
