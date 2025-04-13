"use client";
import "@/styles/page/style.scss";
import PlanningPokerCard from "./components/page/PlanningPokerCard";
import SprintPlannerCard from "./components/page/SprintPlannerCard";
import Footer from "./components/page/Footer";
import Image from "next/image";
import AnnouncementBanner from "./components/common/announcement-banner";

export default function Home() {
  return (
    <>
      <AnnouncementBanner />
      <main className="home-container">
        <div className="home-header">
          <div className="logo-container">
            <Image
              src="/logo.svg"
              alt="GuruBu Logo"
              width={100}
              height={100}
              className="logo-animation"
            />
            <h2 className="logo-text">GuruBu</h2>
          </div>
          <h1 className="home-title">Simple, fast and practical</h1>
          <p className="home-subtitle">Innovative solutions for modern teams</p>
        </div>

        <div className="projects-grid">
          <PlanningPokerCard />
          <SprintPlannerCard />
        </div>
        <Footer />
      </main>
    </>
  );
}
