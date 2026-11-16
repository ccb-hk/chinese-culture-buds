import { assets } from '../content/assets';

const cached = new Set<string>();

function pushStrings(value: unknown, out: string[]) {
  if (typeof value === 'string' && value.startsWith('/assets/')) {
    out.push(value);
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const child of Object.values(value as Record<string, unknown>)) {
    if (typeof child === 'function') continue;
    pushStrings(child, out);
  }
}

/** Shared chrome used on almost every screen. */
function sharedUiUrls(): string[] {
  const out: string[] = [];
  pushStrings(assets.ui, out);
  pushStrings(assets.characters.puff, out);
  pushStrings(assets.characters.dongdong, out);
  return out;
}

/** Theme-scoped art lists. Map uses key `"map"`. */
export function themeAssetUrls(themeId: string): string[] {
  const out = sharedUiUrls();

  if (themeId === 'map') {
    out.push(assets.map.bg);
    return [...new Set(out)];
  }

  if (themeId === 'midautumn') {
    pushStrings(assets.midautumn, out);
    pushStrings(assets.characters.houyi, out);
    pushStrings(assets.characters.change, out);
    pushStrings(assets.characters.family, out);
    out.push(assets.avatar.body('midautumn', 'boy'));
    out.push(assets.avatar.body('midautumn', 'girl'));
    out.push(assets.avatar.outfit('midautumn', 'boy'));
    out.push(assets.avatar.outfit('midautumn', 'girl'));
    out.push(assets.avatar.bow);
    return [...new Set(out)];
  }

  if (themeId === 'dragonboat') {
    pushStrings(assets.dragonboat, out);
    pushStrings(assets.characters.quyuan, out);
    pushStrings(assets.characters.villagers, out);
    out.push(assets.avatar.body('dragonboat', 'boy'));
    out.push(assets.avatar.body('dragonboat', 'girl'));
    out.push(assets.avatar.outfit('dragonboat', 'boy'));
    out.push(assets.avatar.outfit('dragonboat', 'girl'));
    out.push(assets.avatar.bow);
    return [...new Set(out)];
  }

  // Coming-soon themes: just chrome + guide
  return [...new Set(out)];
}

export function isThemeCached(themeId: string): boolean {
  return cached.has(themeId);
}

export function preloadImages(urls: string[]): Promise<void> {
  if (urls.length === 0) return Promise.resolve();
  return Promise.all(
    urls.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.decoding = 'async';
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = src;
        }),
    ),
  ).then(() => undefined);
}

/** Load theme art once; subsequent visits are instant. */
export async function ensureThemeAssets(themeId: string): Promise<void> {
  if (cached.has(themeId)) return;
  await preloadImages(themeAssetUrls(themeId));
  cached.add(themeId);
}
