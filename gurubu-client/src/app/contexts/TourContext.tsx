import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import introJs from "intro.js";
import { groomingBoardTour } from "./constants";

const TourContext = createContext<any>(null);

interface TourProviderProps {
  children: ReactNode;
}

interface TourProviderResponse {
  showTour: boolean;
  startTour: Function;
}

export const TourProvider = ({ children }: TourProviderProps) => {
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const tourCompleted = localStorage.getItem("tourCompleted");
    if (!tourCompleted) {
      setShowTour(true);
    }
  }, []);

  const startTour = () => {
    const intro = introJs();

    intro.setOptions({
      steps: groomingBoardTour,
      showStepNumbers: true,
      disableInteraction: true,
      exitOnOverlayClick: false,
      showBullets: false,
      doneLabel: "Finish",
      exitOnEsc: true,
    });

    intro.onexit(() => {
      localStorage.setItem("tourCompleted", "true");
      setShowTour(false);
    });

    intro.oncomplete(() => {
      localStorage.setItem("tourCompleted", "true");
      setShowTour(false);
    });

    intro.start();
  };

  return (
    <TourContext.Provider value={{ showTour, startTour }}>
      {children}
    </TourContext.Provider>
  );
};

export const useTour = (): TourProviderResponse => {
  return useContext(TourContext);
};
