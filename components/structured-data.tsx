import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/seo-constants'
import { getSiteUrl } from '@/lib/site'
import type { P1GuideFaq } from '@/lib/p1-guide-data'

type WebApplicationJsonLdProps = {
  siteUrl: string
}

export const WebApplicationJsonLd = ({ siteUrl }: WebApplicationJsonLdProps) => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: siteUrl,
    description: SITE_DESCRIPTION,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web browser',
    inLanguage: 'en-SG',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SGD',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

type FaqPageJsonLdProps = {
  pageUrl: string
  faqs: P1GuideFaq[]
}

export const FaqPageJsonLd = ({ pageUrl, faqs }: FaqPageJsonLdProps) => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
    url: pageUrl,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

/** Renders WebApplication JSON-LD using env-based site URL (for root layout). */
export const RootWebApplicationJsonLd = () => {
  const siteUrl = getSiteUrl()
  return <WebApplicationJsonLd siteUrl={siteUrl} />
}
