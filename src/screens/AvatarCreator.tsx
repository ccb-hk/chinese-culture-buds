import { useEffect, useState } from 'react';
import { avatarHeads } from '../content/avatar';
import type { Gender, HeadId } from '../content/types';
import { Avatar } from '../components/Avatar';
import { BigButton } from '../components/BigButton';
import { Subtitle } from '../components/Subtitle';
import { TopBar } from '../components/TopBar';
import { avatarHeadSrc } from '../content/assets';
import { playLine, playSfx, speakText, unlockAudio } from '../engine/audio';
import { useProgress } from '../engine/progress';
import { navigate } from '../engine/routing';
import { useIdleHint } from '../engine/useIdleHint';
import styles from './AvatarCreator.module.css';

type Step = 'name' | 'head' | 'gender' | 'done';

export function AvatarCreator() {
  const { state, dispatch } = useProgress();
  const lang = state.profile?.lang ?? 'yue';
  const [step, setStep] = useState<Step>('name');
  const [name, setName] = useState('小朋友');
  const [head, setHead] = useState<HeadId>('rabbit');
  const [gender, setGender] = useState<Gender>('girl');

  useEffect(() => {
    void unlockAudio();
    if (step === 'name') playLine('avatar_name');
    if (step === 'head') playLine('avatar_head');
    if (step === 'gender') playLine('avatar_gender');
  }, [step]);

  useIdleHint({
    enabled: step !== 'done',
    onIdle: () => {
      if (step === 'name') playLine('avatar_name');
      if (step === 'head') playLine('avatar_head');
      if (step === 'gender') playLine('avatar_gender');
    },
  });

  const finish = () => {
    const finalName = name.trim().slice(0, 8) || '小朋友';
    dispatch({
      type: 'SET_PROFILE',
      profile: {
        name: finalName,
        head,
        gender,
        lang,
      },
    });
    setStep('done');
    playLine('avatar_done', { name: finalName });
    playSfx('cheer');
    window.setTimeout(() => navigate({ name: 'map' }), 2200);
  };

  return (
    <div className={styles.page}>
      <TopBar backTo="start" />
      <Subtitle />

      {step === 'name' && (
        <>
          <h1 className={styles.title}>你叫咩名呀？</h1>
          <p className={styles.hint}>請家長幫小朋友輸入名字（最多 8 個字）</p>
          <input
            className={styles.nameInput}
            value={name}
            maxLength={8}
            onChange={(e) => setName(e.target.value)}
            aria-label="名字"
          />
          <div className={styles.actions}>
            <BigButton onClick={() => setStep('head')}>下一步</BigButton>
            <BigButton
              variant="secondary"
              onClick={() => {
                setName('小朋友');
                setStep('head');
              }}
            >
              略過
            </BigButton>
          </div>
        </>
      )}

      {step === 'head' && (
        <>
          <h1 className={styles.title}>揀頭像</h1>
          <p className={styles.hint}>撳一下，聽佢自我介紹</p>
          <div className={styles.grid}>
            {avatarHeads.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={[styles.headBtn, head === opt.id ? styles.headBtnSelected : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => {
                  setHead(opt.id);
                  playSfx('tap');
                  speakText(opt.intro[lang], lang);
                }}
                aria-label={opt.name[lang]}
              >
                <img
                  src={avatarHeadSrc(opt.id)}
                  alt=""
                  decoding="async"
                  draggable={false}
                />
              </button>
            ))}
          </div>
          <div className={styles.actions}>
            <BigButton onClick={() => setStep('gender')}>下一步</BigButton>
          </div>
        </>
      )}

      {step === 'gender' && (
        <>
          <h1 className={styles.title}>揀一揀</h1>
          <div className={styles.genderRow}>
            <BigButton
              variant={gender === 'boy' ? 'primary' : 'secondary'}
              onClick={() => setGender('boy')}
            >
              男孩
            </BigButton>
            <BigButton
              variant={gender === 'girl' ? 'primary' : 'secondary'}
              onClick={() => setGender('girl')}
            >
              女孩
            </BigButton>
          </div>
          <div className={styles.preview}>
            <Avatar head={head} gender={gender} outfit="daily" size={150} />
          </div>
          <div className={styles.actions}>
            <BigButton onClick={finish}>完成 ✔</BigButton>
          </div>
        </>
      )}

      {step === 'done' && (
        <>
          <h1 className={styles.title}>{name || '小朋友'}，出發啦！</h1>
          <Avatar head={head} gender={gender} outfit="daily" size={180} spinning />
        </>
      )}
    </div>
  );
}
