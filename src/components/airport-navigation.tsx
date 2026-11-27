"use client";

import { useState, type ReactNode } from "react";

/** Shared, keyboard-accessible navigation for all four languages. */
export function AirportNavigation({ children, label, menuLabel }: {
  children: ReactNode; label: string; menuLabel: string;
}) {
  const [open, setOpen] = useState(false);
  return <div className="airport-navigation" onKeyDown={(event) => {
    if (event.key === "Escape") {
      const group = event.currentTarget.querySelector<HTMLDetailsElement>("details[open]");
      if (group) {
        group.open = false;
        group.querySelector("summary")?.focus();
        return;
      }
      setOpen(false);
      event.currentTarget.querySelector<HTMLButtonElement>("button")?.focus();
    }
  }}>
    <button className="airport-menu-toggle" type="button" aria-expanded={open}
      aria-controls="airport-main-navigation" onClick={() => setOpen(!open)}>{menuLabel}</button>
    <nav id="airport-main-navigation" className="topnav" aria-label={label} data-open={open}
      onClick={(event) => { if ((event.target as HTMLElement).closest("a")) setOpen(false); }}>
      {children}
    </nav>
  </div>;
}
