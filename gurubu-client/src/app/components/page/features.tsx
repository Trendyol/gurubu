"use client"
import Image from "next/image";
import { useState } from "react";
import cn from 'classnames';

const Features = () => {
  const [activeTab, setActiveTab] = useState("score")
  
  const scoreTabStyle = cn('features-tabs__score', {active: activeTab === 'score'});
  const planningTabStyle = cn('features-tabs__planning', {active: activeTab === 'planning'});
  const imageSrc = activeTab === "score" ? "/score-grooming-mock.svg" : "/planning-poker-mock.svg";


  return (
    <section id="products" className="features-section">
      <div className="features-heading">
        <div className="features-heading__pillbox">Features</div>
        <p className="features-heading__title">No registration, share the link with your teammates and get started!</p>
        <p className="features-heading__subtext">It is enough to create a room and share the link with your friends. We do not store any of your information!</p>
      </div>
      <div className="features-spotlight">
        <Image src={imageSrc} width={768} height={512} alt="An example of in app visuals" />
      </div>
      <div className="features-tabs">
        <div className={scoreTabStyle} onClick={() => setActiveTab("score")}>
          <p className="title">Score grooming</p>
          <p className="description">If you want to score and sort tasks according to more than one metric, this option is for you!</p>
        </div>
        <div className={planningTabStyle} onClick={() => setActiveTab("planning")}>
          <p className="title">Planning poker</p>
          <p className="description">If you only want to determine story points, you can choose this option that will allow you to score according to Fibonacci.</p>
        </div>
      </div>
    </section>
  );
};

export default Features;
