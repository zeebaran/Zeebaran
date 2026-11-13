"use client";
import { createContext, useContext, type ReactNode } from "react";
import type { ContentValue } from "./model";
const Context = createContext<Record<string, ContentValue> | null>(null);
const EditingContext = createContext(false);
export function VisualContentProvider({
  value,
  editing = true,
  children,
}: {
  value: Record<string, ContentValue>;
  editing?: boolean;
  children: ReactNode;
}) {
  return (
    <EditingContext.Provider value={editing}>
      <Context.Provider value={value}>{children}</Context.Provider>
    </EditingContext.Provider>
  );
}
export const useVisualContent = () => useContext(Context);
export const useVisualEditing = () => useContext(EditingContext);
