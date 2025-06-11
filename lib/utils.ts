import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Función para generar ID único
export const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}
