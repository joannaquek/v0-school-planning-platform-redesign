import type { Metadata } from 'next'
import { GuidePageClient } from '@/components/guide-page-client'
import { FaqPageJsonLd } from '@/components/structured-data'
import { p1GuideFaqs } from '@/lib/p1-guide-data'
import { GUIDE_PAGE_DESCRIPTION, SITE_NAME } from '@/lib/seo-constants'
import { getSiteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: `P1 Registration Guide | ${SITE_NAME}`,
  description: GUIDE_PAGE_DESCRIPTION,
}

export default function GuidePage() {
  const siteUrl = getSiteUrl()
  const guideUrl = `${siteUrl}/guide`

  return (
    <>
      <FaqPageJsonLd pageUrl={guideUrl} faqs={p1GuideFaqs} />
      <GuidePageClient />
    </>
  )
}
