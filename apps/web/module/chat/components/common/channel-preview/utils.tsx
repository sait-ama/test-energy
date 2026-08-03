import { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';

import { ChannelSchema, MessageSchema } from '../../../model/types';

export const renderPreviewText = (text: string) => {
  // Strip HTML tags from the text
  const strippedText = text.replace(/<[^>]*>/g, '');
  return <ReactMarkdown>{strippedText}</ReactMarkdown>;
};

export const formatMessageTimestamp = (timestamp: string | undefined | null): string => {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Today: show time
  if (date >= today) {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }

  // Yesterday: show "Вчера"
  if (date >= yesterday && date < today) {
    return 'Вчера';
  }

  // This year: show day and month
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }).replace('.', '');
  }

  // Different year: show date with year
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

export const getLatestMessagePreview = (
  lastMessage: MessageSchema | null | undefined
): ReactNode => {
  if (!lastMessage) {
    return '';
  }

  const previewTextToRender = lastMessage.text;

  if (previewTextToRender) {
    return renderPreviewText(previewTextToRender);
  }

  if (lastMessage.attachments?.length) {
    return 'Файл';
  }

  return '';
};

export const channelToSubtitle = (channel: ChannelSchema) => {
  switch (channel.type) {
    case 'private':
      return 'Личный чат';
    case 'group':
      return 'Группа';
    default:
      return '';
  }
};
