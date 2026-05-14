/** Canonical site origin for metadata and JSON-LD. Set NEXT_PUBLIC_SITE_URL on Vercel if the primary domain changes. */
export const getSiteUrl = (): string => {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sgprimaryschool.vercel.app'
  return raw.replace(/\/$/, '')
}
