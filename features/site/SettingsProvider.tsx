"use client";
import { createContext, useContext, type ReactNode } from "react";
import { defaultSettings, type SiteSettings } from "./model";
const SettingsContext = createContext({ settings: defaultSettings(), configured: false });
export function SettingsProvider({
  settings,
  configured,
  children,
}: {
  settings: SiteSettings;
  configured: boolean;
  children: ReactNode;
}) {
  return (
    <SettingsContext.Provider value={{ settings, configured }}>{children}</SettingsContext.Provider>
  );
}
export const useSiteSettings = () => useContext(SettingsContext);
