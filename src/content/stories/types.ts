import type { OutfitId } from '../types';

export type HotspotKind =
  | 'sun_wiggle'
  | 'sun_dismiss'
  | 'star_glow'
  | 'label_bounce'
  | 'tap_progress'
  | 'character_wave';

export type StoryHotspot = {
  id: string;
  kind: HotspotKind;
  /** Percent positions within the stage. */
  x: number;
  y: number;
  size?: number;
  /** Spoken / shown label when tapped (e.g. 月餅！). */
  label?: { yue: string; pu: string };
  /** Emoji / short glyph for the hotspot button. */
  emoji?: string;
};

export type StoryCharacter = {
  id: string;
  right?: string;
  left?: string;
  bottom?: string;
  width?: string;
};

export type StoryScene = {
  id: string;
  bg: string;
  fg?: string;
  lineId: string;
  /** Show player avatar in this scene. */
  showPlayer?: boolean;
  playerOutfit?: OutfitId;
  characters?: StoryCharacter[];
  hotspots?: StoryHotspot[];
  /**
   * How many hotspot interactions are required before advancing.
   * Defaults to 0 (auto after narration when autoAdvance).
   */
  requiredInteractions?: number;
  /** If true, advance automatically after narration (and optional wait). */
  autoAdvance?: boolean;
};

export type StoryConfig = {
  id: string;
  themeId: string;
  title: { yue: string; pu: string };
  idleLine?: string;
  scenes: StoryScene[];
};
