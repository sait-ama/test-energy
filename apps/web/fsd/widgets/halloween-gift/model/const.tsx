export const HalloweenGiftPosition = {
  LEFT: 'l',
  RIGHT_BOTTOM: 'rb',
  LEFT_BOTTOM: 'lb',
} as const;

export const HALLOWEEN_GIFT_IMAGES = {
  [HalloweenGiftPosition.LEFT]: `/halloween-gift/${HalloweenGiftPosition.LEFT}.png`,
  [HalloweenGiftPosition.RIGHT_BOTTOM]: `/halloween-gift/${HalloweenGiftPosition.RIGHT_BOTTOM}.png`,
  [HalloweenGiftPosition.LEFT_BOTTOM]: `/halloween-gift/${HalloweenGiftPosition.LEFT_BOTTOM}.png`,
} as const;
