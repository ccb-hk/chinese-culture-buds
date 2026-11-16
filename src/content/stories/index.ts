import { dragonboatStory } from './dragonboat';
import { midautumnStory } from './midautumn';
import type { StoryConfig } from './types';

const stories: StoryConfig[] = [midautumnStory, dragonboatStory];
const byId = new Map(stories.map((s) => [s.id, s]));

export function getStory(activityId: string): StoryConfig | undefined {
  return byId.get(activityId);
}

export type { StoryConfig, StoryScene, StoryHotspot } from './types';
