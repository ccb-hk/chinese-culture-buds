import type { StoryConfig } from './types';

export const dragonboatStory: StoryConfig = {
  id: 'db_story',
  themeId: 'dragonboat',
  title: { yue: '屈原爺爺與龍舟', pu: '屈原爷爷与龙舟' },
  idleLine: 'db_idle',
  scenes: [
    {
      id: 'db_s1',
      bg: 'dragonboat/story/scene_1_bg.svg',
      lineId: 'db_story_1',
      characters: [{ id: 'quyuan', right: '18%', bottom: '10%' }],
      hotspots: [
        { id: 'quyuan', kind: 'character_wave', x: 78, y: 55, size: 120, emoji: '👴' },
      ],
      requiredInteractions: 0,
      autoAdvance: true,
    },
    {
      id: 'db_s2',
      bg: 'dragonboat/story/scene_2_bg.svg',
      lineId: 'db_story_2',
      autoAdvance: true,
    },
    {
      id: 'db_s3',
      bg: 'dragonboat/story/scene_3_bg.svg',
      lineId: 'db_story_3',
      characters: [{ id: 'dongdong', left: '12%', bottom: '18%', width: 'min(22vw, 170px)' }],
      hotspots: [
        { id: 'drum', kind: 'tap_progress', x: 50, y: 72, size: 140, emoji: '🥁' },
      ],
      requiredInteractions: 6,
    },
    {
      id: 'db_s4',
      bg: 'dragonboat/story/scene_4_bg.svg',
      lineId: 'db_story_4',
      hotspots: [
        { id: 'z1', kind: 'sun_dismiss', x: 22, y: 40, size: 96, emoji: '🍙' },
        { id: 'z2', kind: 'sun_dismiss', x: 48, y: 36, size: 96, emoji: '🍙' },
        { id: 'z3', kind: 'sun_dismiss', x: 74, y: 42, size: 96, emoji: '🍙' },
      ],
      requiredInteractions: 3,
    },
    {
      id: 'db_s5',
      bg: 'dragonboat/story/scene_5_bg.svg',
      lineId: 'db_story_5',
      showPlayer: true,
      playerOutfit: 'dragonboat',
      hotspots: [
        {
          id: 'boat',
          kind: 'label_bounce',
          x: 30,
          y: 55,
          size: 100,
          emoji: '🐉',
          label: { yue: '龍舟！', pu: '龙舟！' },
        },
        {
          id: 'zongzi',
          kind: 'label_bounce',
          x: 55,
          y: 62,
          size: 96,
          emoji: '🍙',
          label: { yue: '糭！', pu: '粽子！' },
        },
        {
          id: 'sachet',
          kind: 'label_bounce',
          x: 78,
          y: 58,
          size: 96,
          emoji: '🎀',
          label: { yue: '香包！', pu: '香包！' },
        },
      ],
      requiredInteractions: 0,
      autoAdvance: true,
    },
    {
      id: 'db_s6',
      bg: 'dragonboat/story/scene_6_bg.svg',
      lineId: 'db_story_6',
      characters: [{ id: 'dongdong', right: '16%', bottom: '18%' }],
      autoAdvance: true,
    },
  ],
};
