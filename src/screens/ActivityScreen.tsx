import { isActivityLocked } from '../config/access';
import { appConfig } from '../config/app';
import { getStory } from '../content/stories';
import { getTheme } from '../content/themes';
import { LanternGame } from '../activities/LanternGame';
import { PuzzleGame } from '../activities/PuzzleGame';
import { RaceGame } from '../activities/RaceGame';
import { StoryPlayer } from '../activities/StoryPlayer';
import { ZongziGame } from '../activities/ZongziGame';
import { BigButton } from '../components/BigButton';
import { playSfx } from '../engine/audio';
import { useProgress } from '../engine/progress';
import { navigate } from '../engine/routing';
import { ActivityPlaceholder } from './ActivityPlaceholder';

type Props = {
  themeId: string;
  activityId: string;
};

export function ActivityScreen({ themeId, activityId }: Props) {
  const theme = getTheme(themeId);
  const activityIndex = theme?.activities.findIndex((a) => a.id === activityId) ?? -1;
  const activity = activityIndex >= 0 ? theme?.activities[activityIndex] : undefined;
  const { state, dispatch } = useProgress();
  const lang = state.profile?.lang ?? appConfig.defaultLang;

  const completeAndReturn = () => {
    dispatch({ type: 'COMPLETE_ACTIVITY', activityId });
    playSfx('cheer');
    navigate({ name: 'theme', themeId });
  };

  if (activityIndex >= 0 && isActivityLocked(activityIndex, state.surveyUnlocked)) {
    return (
      <section className="screen" aria-label="已鎖定">
        <h1>內容已鎖定</h1>
        <p>{appConfig.paidComingSoon[lang]}</p>
        <p>請返主題頁經家長鎖／問卷解鎖，或喺家長專區開啟問卷。</p>
        <BigButton onClick={() => navigate({ name: 'theme', themeId })}>返回主題</BigButton>
      </section>
    );
  }

  if (activity?.type === 'story') {
    const story = getStory(activityId);
    if (story) {
      return <StoryPlayer story={story} onComplete={completeAndReturn} />;
    }
  }

  if (activity?.type === 'lantern') {
    return <LanternGame onComplete={completeAndReturn} />;
  }

  if (activity?.type === 'puzzle') {
    return <PuzzleGame onComplete={completeAndReturn} />;
  }

  if (activity?.type === 'zongzi') {
    return <ZongziGame onComplete={completeAndReturn} />;
  }

  if (activity?.type === 'race') {
    return <RaceGame onComplete={completeAndReturn} />;
  }

  return <ActivityPlaceholder themeId={themeId} activityId={activityId} />;
}
