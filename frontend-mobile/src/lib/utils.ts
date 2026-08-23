/**
 * Class-name helpers
 *
 * Owns Tailwind class merging for NativeWind and Reusables components.
 * Does not know about screens or theme values.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges conditional class names and resolves Tailwind conflicts.
 *
 * @param inputs Class values from `clsx`.
 * @returns A single class string safe to pass to `className`.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
