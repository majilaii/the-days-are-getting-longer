import { notFound } from 'next/navigation'
import { sanityFetch } from '@/sanity/lib/client'
import { dayMarksByYearQuery } from '@/sanity/lib/queries'
import { YearGrid } from '@/components/year/YearGrid'
import type { DayMark } from '@/lib/types'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ year: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year } = await params
  return { title: year }
}

export default async function YearPage({ params }: Props) {
  const { year } = await params
  const yearNum = parseInt(year, 10)

  if (isNaN(yearNum) || yearNum < 2026 || yearNum > 2100) {
    notFound()
  }

  const yearStart = `${year}-01-01`
  const yearEnd = `${year}-12-31`

  const marks = await sanityFetch<DayMark[]>(
    dayMarksByYearQuery,
    { yearStart, yearEnd },
    []
  )

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <YearGrid year={yearNum} marks={marks} />
    </div>
  )
}
