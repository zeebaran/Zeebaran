"use client";
import { createContext, useContext, type ReactNode } from "react";
import type { ContentValue } from "./model";
const Context = createContext<Record<string, ContentValue> | null>(null);
export function VisualContentProvider({
  value,
  children,
}: {
  value: Record<string, ContentValue>;
  children: ReactNode;
}) {
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export const useVisualContent = () => useContext(Context);
