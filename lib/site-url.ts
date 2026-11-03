export const productionOrigin = 'https://www.jaisalgo.com';

/** Metadata is a public production contract, never a request host or callback URL. */
export function siteOrigin(value = process.env.NEXT_PUBLIC_SITE_URL): string {
  if (!value?.trim()) return productionOrigin;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' || url.username || url.password || url.port ||
        url.pathname !== '/' || url.search || url.hash ||
        url.hostname === 'localhost' || !url.hostname.includes('.') ||
        /^\d+\.\d+\.\d+\.\d+$/.test(url.hostname)) return productionOrigin;
    if (url.hostname === 'jaisalgo.com') return productionOrigin;
    return url.origin;
  } catch {
    return productionOrigin;
  }
}

export function canonicalUrl(path: string, origin = siteOrigin()): string {
  if (!path.startsWith('/') || path.startsWith('//')) throw new Error('A canonical needs a local path.');
  const url = new URL(path, origin);
  if (url.origin !== origin) throw new Error('A canonical must stay on the site.');
  url.search = '';
  url.hash = '';
  url.pathname = url.pathname.replace(/\/+$/, '') || '/';
  return url.href;
}
