/**
 * The Bloom levels the design system styles (add-ui-foundation). [OPEN] The ID also uses analyse
 * (LO7, LO9); the design system has no colour or glyph for it, so the chip does not accept it until
 * the design adds one.
 */
export const CHIP_LEVELS = ['remember', 'understand', 'apply'] as const
export type ChipLevel = (typeof CHIP_LEVELS)[number]
