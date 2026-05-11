import { createContext, useContext, useEffect, useState } from "react";
import { DirectionProvider } from "@radix-ui/react-direction";
import i18n from "i18next";

type Language = "english" | "arabic";
type Direction = "ltr" | "rtl";
type ThemeColor = "blue" | "orange" | "green" | "red" | "purple" | string;

interface SettingsContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  direction: Direction;
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
}

const SettingsContext = createContext<SettingsContextProps | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("english");
  const [themeColor, setThemeColorState] = useState<ThemeColor>("blue");

  useEffect(() => {
    const savedLang = localStorage.getItem("app-language") as Language;
    if (savedLang && ["english", "arabic"].includes(savedLang)) {
      setLanguageState(savedLang);
    }

    const savedTheme = localStorage.getItem("app-theme") as ThemeColor;
    if (savedTheme) {
      setThemeColorState(savedTheme);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app-language", lang);
    i18n.changeLanguage(lang === "arabic" ? "ar" : "en");
  };

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color);
    localStorage.setItem("app-theme", color);
  };

  const direction: Direction = language === "arabic" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language === "arabic" ? "ar" : "en";
  }, [direction, language]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeColor);
  }, [themeColor]);

  return (
    <SettingsContext.Provider
      value={{ language, setLanguage, direction, themeColor, setThemeColor }}
    >
      <DirectionProvider dir={direction}>{children}</DirectionProvider>
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
