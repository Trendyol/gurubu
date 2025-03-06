import confetti from "canvas-confetti";
import { useEffect, useState } from "react";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { GroomingMode } from "@/shared/enums";

const ConsensusBanner = () => {
  const [hasShownConsensus, setHasShownConsensus] = useState(false);
  const { groomingInfo } = useGroomingRoom();

  const checkConsensus = () => {
    if (
      !groomingInfo.isResultShown ||
      groomingInfo.mode === GroomingMode.ScoreGrooming
    )
      return false;

    const votes = Object.values(groomingInfo.participants)
      .map((p) => p.votes?.storyPoint)
      .filter((vote) => vote !== undefined && vote !== "?" && vote !== "break" && vote !== "");

    if (votes.length < 2) return false;

    return votes.every((vote) => vote === votes[0]);
  };

  const triggerConsensusAnimation = () => {
    const duration = 1000;
    const animationEnd = Date.now() + duration;
    const colors = ["#fac515", "#85e13a", "#0085ff", "#ff6b6b", "#4ca30d"];

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    (function frame() {
      confetti({
        particleCount: 8,
        angle: 60,
        spread: 80,
        origin: { x: 0, y: 0.6 },
        colors: colors,
        startVelocity: 45,
        gravity: 1,
        shapes: ["circle", "square"],
        scalar: 1.2,
        ticks: 200,
        drift: randomInRange(-0.4, 0.4),
      });

      confetti({
        particleCount: 8,
        angle: 120,
        spread: 80,
        origin: { x: 1, y: 0.6 },
        colors: colors,
        startVelocity: 45,
        gravity: 1,
        shapes: ["circle", "square"],
        scalar: 1.2,
        ticks: 200,
        drift: randomInRange(-0.4, 0.4),
      });

      if (Date.now() <= animationEnd - 4000) {
        confetti({
          particleCount: 4,
          angle: 90,
          spread: 120,
          origin: { x: 0.5, y: 0.8 },
          colors: colors,
          startVelocity: 30,
          gravity: 0.8,
          shapes: ["circle"],
          scalar: 1,
          ticks: 150,
          drift: randomInRange(-0.2, 0.2),
        });
      }

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    })();
  };

  useEffect(() => {
    if (groomingInfo.isResultShown) {
      if (checkConsensus() && !hasShownConsensus) {
        triggerConsensusAnimation();
        setHasShownConsensus(true);
      }
    } else {
      setHasShownConsensus(false);
    }
  }, [groomingInfo]);

  return (
    checkConsensus() && (
      <div className="consensus-banner">
        <span>You reached full consensus!</span>
      </div>
    )
  );
};

export default ConsensusBanner;
