import { Metadata } from 'next'
import { Footer } from '@/components/layout/Footer'
import { AboutClientContent } from './AboutClientContent'

export const metadata: Metadata = {
  title: 'About Us — ScholarSearch',
  description:
    'Learn about the team behind ScholarSearch — five first-year engineering students from Christ College of Engineering, Irinjalakuda, building tools to democratize access to education.',
  openGraph: {
    title: 'About Us — ScholarSearch',
    description:
      'Five first-year students. One mission: make scholarships accessible to every student.',
  },
}

export default function AboutPage() {
  return (
    <>
      <main className="max-w-[760px] mx-auto px-4 sm:px-6 py-12 lg:py-20">
        <AboutClientContent />
      </main>
      <Footer />
    </>
  )
}
