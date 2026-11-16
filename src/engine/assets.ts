/** Central asset path helper — swap file extensions later without touching components. */

export function assetPath(...parts: string[]): string {
  const cleaned = parts
    .join('/')
    .replace(/\\/g, '/')
    .replace(/\/+/g, '/')
    .replace(/^\/+/, '');
  return `/assets/${cleaned}`;
}

export function audioPath(folder: 'yue' | 'pu' | 'sfx' | 'bgm', fileName: string): string {
  return `/audio/${folder}/${fileName}`;
}
