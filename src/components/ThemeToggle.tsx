"use client";

import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const toggle = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("cf-theme", isDark ? "dark" : "light");
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light and dark mode"
      title="Light / dark mode"
      className="flex size-9 items-center justify-center rounded-full border border-latte bg-paper text-bark transition-all hover:-translate-y-px hover:border-brand hover:text-brand-dark"
    >
      <Sun className="hidden size-4 dark:block" strokeWidth={1.75} />
      <Moon className="block size-4 dark:hidden" strokeWidth={1.75} />
    </button>
  );
}
