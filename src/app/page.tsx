import CallToAction from "@/components/front-page/CallToAction"
import HeroSection from "@/components/front-page/HeroSection"
import ReviewsSection from "@/components/front-page/ReviewsSection"

export default function Home() {
  return (
    <div className="bg-slate-50 grainy-light">
      <HeroSection />

      <ReviewsSection />

      <CallToAction />
    </div>
  )
}
