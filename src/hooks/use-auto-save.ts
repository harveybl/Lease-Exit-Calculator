"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { type UseFormWatch } from "react-hook-form";

/**
 * Auto-save hook for form drafts to localStorage with debouncing.
 * SSR-safe: all localStorage access guarded by typeof window checks.
 */
export function useFormAutoSave<T extends Record<string, unknown>>(
  watch: UseFormWatch<T>,
  storageKey: string,
  delay: number = 500
): {
  loadSaved: () => Partial<T> | null;
  clearSaved: () => void;
  hasSavedDraft: boolean;
} {
  const [hasSavedDraft, setHasSavedDraft] = useState(false);

  // Watch all form values
  const formData = watch();

  // Debounce form data changes
  const [debouncedData] = useDebounce(formData, delay);

  // Check for saved draft on mount (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey);
      setHasSavedDraft(!!saved);
    }
  }, [storageKey]);

  // Save debounced data to localStorage (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined" && debouncedData) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(debouncedData));
        setHasSavedDraft(true);
      } catch (error) {
        console.error("Failed to save form draft to localStorage:", error);
      }
    }
  }, [debouncedData, storageKey]);

  // Load saved data (client-side only, call in useEffect)
  const loadSaved = (): Partial<T> | null => {
    if (typeof window === "undefined") return null;

    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Failed to load saved draft from localStorage:", error);
      return null;
    }
  };

  // Clear saved draft (client-side only)
  const clearSaved = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(storageKey);
        setHasSavedDraft(false);
      } catch (error) {
        console.error("Failed to clear saved draft from localStorage:", error);
      }
    }
  };

  return { loadSaved, clearSaved, hasSavedDraft };
}
