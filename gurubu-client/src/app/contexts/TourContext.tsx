import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import introJs from "intro.js";
import { useGroomingRoom } from "./GroomingRoomContext";
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

  const { userInfo } = useGroomingRoom();

  useEffect(() => {
    const tourCompleted = localStorage.getItem("tourCompleted");
    if (!tourCompleted) {
      setShowTour(true);
    }
  }, []);

  const startTour = () => {
    const intro = introJs();
    if (userInfo.lobby?.isAdmin) {
      groomingBoardTour.push({
        title: "Jira Table",
        element: ".grooming-navbar__content-import-jira-issues",
        intro:
          "You can easily access the Jira board, detailed explanation will shared soon!",
        position: "bottom",
      });
    }

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