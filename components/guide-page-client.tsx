'use client'

import {
  Calendar,
  Clock,
  MapPin,
  Users,
  FileText,
  AlertCircle,
  CheckCircle,
  Lightbulb,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Header } from '@/components/header'
import { MobileNav } from '@/components/mobile-nav'
import { p1GuidePhases, p1GuideDistanceBands, p1GuideFaqs } from '@/lib/p1-guide-data'

const tips = [
  {
    icon: MapPin,
    title: 'Check your distance early',
    description:
      "Use your postal code to calculate distances to schools you're interested in. Living within 1km makes a significant difference.",
  },
  {
    icon: Calendar,
    title: 'Know the timeline',
    description:
      "Registration happens in July-August the year before P1 starts. Mark the dates and prepare documents early.",
  },
  {
    icon: Users,
    title: 'Consider parent volunteering',
    description:
      'Many schools offer parent volunteer programs. Starting early (usually 2 years before P1) can help qualify for Phase 2A.',
  },
  {
    icon: FileText,
    title: 'Have backup options',
    description:
      'Research multiple schools in case your first choice requires balloting. Understanding pressure levels helps you make informed decisions.',
  },
]

export const GuidePageClient = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <Badge variant="secondary" className="mb-3">
            <Calendar className="mr-1.5 h-3.5 w-3.5" />
            2025 Registration Guide
          </Badge>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">P1 Registration Guide</h1>
          <p className="mt-2 text-muted-foreground">
            Everything you need to know about Singapore&apos;s Primary 1 registration process
          </p>
        </div>

        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Quick Tips</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tips.map((tip) => (
              <Card key={tip.title}>
                <CardContent className="p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <tip.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 font-medium text-foreground">{tip.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{tip.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Registration Phases</h2>
          <div className="space-y-4">
            {p1GuidePhases.map((phase, index) => (
              <Card key={phase.phase}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {phase.phase}: {phase.title}
                        </h3>
                        {phase.guaranteed && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="mr-1 h-3 w-3 text-success" />
                            Guaranteed
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{phase.description}</p>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{phase.eligibility}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{phase.timing}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Distance Priority</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {p1GuideDistanceBands.map((band, index) => (
                  <div key={band.band} className="flex items-start gap-4 p-4 sm:p-6">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">{band.band}</h3>
                        <Badge variant="outline" className="text-xs">
                          {band.priority} Priority
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{band.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="mt-4 flex items-start gap-3 rounded-lg bg-warning/10 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-warning-foreground" />
            <div className="text-sm">
              <p className="font-medium text-warning-foreground">Important Note</p>
              <p className="mt-1 text-muted-foreground">
                Within each distance band, Singapore Citizens are given priority over Permanent Residents.
                If balloting is required, it happens within the same priority group.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Frequently Asked Questions</h2>
          <Card>
            <CardContent className="p-0">
              <Accordion type="single" collapsible className="w-full">
                {p1GuideFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="px-4 sm:px-6 text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="px-4 sm:px-6 pb-4 text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </section>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Pro Tip</h3>
                <p className="mt-1 text-muted-foreground">
                  Use our comparison tool to evaluate multiple schools side-by-side. Look at historical ballot rates,
                  not just current year data, to understand true competition levels. Schools with consistent low
                  pressure across years are safer choices.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <MobileNav />
    </div>
  )
}
