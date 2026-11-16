import type { HeadId, LocalizedText } from './types';

export type AvatarHeadOption = {
  id: HeadId;
  name: LocalizedText;
  intro: LocalizedText;
};

export const avatarHeads: AvatarHeadOption[] = [
  {
    id: 'rat',
    name: { yue: '小老鼠', pu: '小老鼠' },
    intro: { yue: '我係小老鼠！', pu: '我是小老鼠！' },
  },
  {
    id: 'ox',
    name: { yue: '小牛牛', pu: '小牛牛' },
    intro: { yue: '我係小牛牛！', pu: '我是小牛牛！' },
  },
  {
    id: 'tiger',
    name: { yue: '小老虎', pu: '小老虎' },
    intro: { yue: '我係小老虎！', pu: '我是小老虎！' },
  },
  {
    id: 'rabbit',
    name: { yue: '小兔子', pu: '小兔子' },
    intro: { yue: '我係小兔子！', pu: '我是小兔子！' },
  },
  {
    id: 'dragon',
    name: { yue: '小龍仔', pu: '小龙仔' },
    intro: { yue: '我係小龍仔！', pu: '我是小龙仔！' },
  },
  {
    id: 'snake',
    name: { yue: '小蛇蛇', pu: '小蛇蛇' },
    intro: { yue: '我係小蛇蛇！', pu: '我是小蛇蛇！' },
  },
  {
    id: 'horse',
    name: { yue: '小馬兒', pu: '小马儿' },
    intro: { yue: '我係小馬兒！', pu: '我是小马儿！' },
  },
  {
    id: 'goat',
    name: { yue: '小羊羊', pu: '小羊羊' },
    intro: { yue: '我係小羊羊！', pu: '我是小羊羊！' },
  },
  {
    id: 'monkey',
    name: { yue: '小猴子', pu: '小猴子' },
    intro: { yue: '我係小猴子！', pu: '我是小猴子！' },
  },
  {
    id: 'rooster',
    name: { yue: '小公雞', pu: '小公鸡' },
    intro: { yue: '我係小公雞！', pu: '我是小公鸡！' },
  },
  {
    id: 'dog',
    name: { yue: '小狗狗', pu: '小狗狗' },
    intro: { yue: '我係小狗狗！', pu: '我是小狗狗！' },
  },
  {
    id: 'pig',
    name: { yue: '小豬豬', pu: '小猪猪' },
    intro: { yue: '我係小豬豬！', pu: '我是小猪猪！' },
  },
  {
    id: 'panda',
    name: { yue: '小熊貓', pu: '小熊猫' },
    intro: { yue: '我係小熊貓！', pu: '我是小熊猫！' },
  },
];

export function getHeadOption(id: HeadId): AvatarHeadOption {
  return avatarHeads.find((h) => h.id === id) ?? avatarHeads[3];
}
