import { useTheme, ThemeType } from "@/contexts/ThemeContext";
import { IconSnowflake, IconPalette } from "@tabler/icons-react";
import { useState, useRef, useEffect } from "react";

const themeConfigs = {
  snow: {
    icon: IconSnowflake,
    label: "Snow Theme",
  },
  default: {
    icon: IconPalette,
    label: "Original Theme",
  },
};

const ThemeSelector = () => {
  const { currentTheme, isThemeActive, setTheme, toggleTheme } = useTheme();
  const [showThemeOptions, setShowThemeOptions] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  const handleThemeChange = (theme: ThemeType) => {
    if (currentTheme !== theme) {
      setTheme(theme);
    }
    if (!isThemeActive) {
      toggleTheme();
    }
    setShowThemeOptions(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectorRef.current &&
        !selectorRef.current.contains(event.target as Node)
      ) {
        setShowThemeOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const CurrentThemeIcon =
    themeConfigs[currentTheme as keyof typeof themeConfigs]?.icon;

  return (
    <div className="theme-selector-container" ref={selectorRef}>
      <button
        title="theme"
        className={`theme-selector-trigger ${isThemeActive ? "active" : ""}`}
        onClick={() => setShowThemeOptions(!showThemeOptions)}
      >
        {CurrentThemeIcon && <CurrentThemeIcon size={24} />}
      </button>

      {showThemeOptions && (
        <div className="theme-selector-dropdown">
          {Object.entries(themeConfigs).map(([theme, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={theme}
                className={`theme-selector-option ${
                  currentTheme === theme && isThemeActive ? "active" : ""
                }`}
                onClick={() => handleThemeChange(theme as ThemeType)}
              >
                {Icon && <Icon size={16} />}
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
