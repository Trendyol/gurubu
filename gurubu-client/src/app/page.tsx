import Footer from "@/components/common/footer";
import Navbar from "@/components/common/navbar";
import HeroSection from "@/components/page/heroSection";
import Testimonial from "@/components/page/testimonial";
import Features from "./components/page/features";
import { Pricing } from "@/components/page/pricing";
import "@/styles/page/style.scss";

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <Testimonial />
      <Features/>
      <Pricing />
      <Footer />
    </main>
  );
}
