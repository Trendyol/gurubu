import Footer from "./components/common/footer";
import Navbar from "./components/common/navbar";
import HeroSection from "./components/page/heroSection";
import "./styles/page/style.scss";

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <Footer />
    </main>
  );
}
