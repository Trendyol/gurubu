import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import introJs from "intro.js";

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
      steps: [
        {
          title: "test",
          element: ".grooming-board__voting-sticks",
          intro: "Welcome to GuruBu!",
        },
        {
          element: ".grooming-board__voting-sticks",
          intro: "Here you can manage your settings.",
        },
        {
          element: ".grooming-board__voting-sticks",
          intro: "Click here to log out.",
        },
      ],
      showStepNumbers: false,
      disableInteraction: true,
      exitOnOverlayClick: false,
      showBullets: false,
      doneLabel: "Finish",
    });

    intro.onexit(() => {
      localStorage.setItem("tourCompleted", "true");
      setShowTour(false);
    });

    intro.oncomplete(() => {
      localStorage.setItem("tourCompleted", "true");
      setShowTour(false);
    });

    intro.onafterchange((targetElement) => {
      if (targetElement) {
        targetElement.focus();
      }
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
