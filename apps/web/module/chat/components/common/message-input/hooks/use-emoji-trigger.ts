import { EmoticonItem } from '../../emoticon-item/emoticon-item';
import type { EmojiSearchIndex } from '../message-input';
import type { EmojiTriggerSetting } from '../trigger-provider';

export const useEmojiTrigger = <T extends EmojiSearchIndex>(
  emojiSearchIndex?: T
): EmojiTriggerSetting => ({
  component: EmoticonItem,
  dataProvider: async (query, _, onReady) => {
    if (query.length === 0 || query.charAt(0).match(/[^a-zA-Z0-9+-]/)) {
      return onReady([], query);
    }
    const emojis = (await emojiSearchIndex?.search(query)) ?? [];

    // emojiIndex.search sometimes returns undefined values, so filter those out first
    const result = emojis
      .filter(Boolean)
      .slice(0, 100)
      .map(({ id, name, native, skins = [] }) => {
        const [firstSkin] = skins;

        return {
          id,
          name,
          native: native ?? firstSkin.native,
        };
      });

    if (onReady) onReady(result, query);
  },
  output: (entity) => ({
    caretPosition: 'next',
    key: entity.id as string,
    text: `${'native' in entity ? entity.native : ''}`,
  }),
});
