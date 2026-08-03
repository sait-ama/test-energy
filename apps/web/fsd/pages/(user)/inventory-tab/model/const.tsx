export enum InventoryTab {
  CARDS = 'cards',
  DECKS = 'decks',
  TITLES = 'read_titles',
  AVATARS = 'avatars',
  FRAMES = 'frames',
  WALLPAPERS = 'wallpapers',
  EMOJI = 'emoji',
  MOMENTS = 'moments',
  THEMES = 'theme',
  CUSTOMIZATION = 'customization',
  COLLECTIONS = 'collections',
}

export const customizationTabs = [
  {
    tab: InventoryTab.AVATARS,
  },
  {
    tab: InventoryTab.FRAMES,
  },
  {
    tab: InventoryTab.EMOJI,
  },
  {
    tab: InventoryTab.WALLPAPERS,
  },
  {
    tab: InventoryTab.THEMES,
    currentOnly: true,
    loggedOnly: true,
  },
] satisfies {
  tab: InventoryTab;
  loggedOnly?: boolean;
  currentOnly?: boolean;
  canReadByStaff?: boolean;
}[];

export const MAX_FAVORITE_CARDS = 12;
export const MAX_EXCHANGEABLE_CARDS = 20;
