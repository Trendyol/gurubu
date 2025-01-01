import { useTheme } from "@/contexts/ThemeContext";
import SnowAnimation from "@/components/room/grooming-navbar/snow-animation";
import { memo } from "react";

const ThemeLayout = memo(() => {
  const { currentTheme, isThemeActive } = useTheme();

  const renderThemeAnimation = () => {
    switch (currentTheme) {
      case "snow":
        return <SnowAnimation isActive={isThemeActive} />;
      default:
        return null;
    }
  };

  return (
    <>
      {renderThemeAnimation()}
      <div
        className={`theme-container ${currentTheme} ${
          isThemeActive ? "active" : ""
        }`}
      />
    </>
  );
});

ThemeLayout.displayName = "ThemeLayout";

export default ThemeLayout;
