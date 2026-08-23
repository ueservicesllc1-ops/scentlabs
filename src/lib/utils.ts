import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: amount % 1 === 0 ? 2 : 2,
    maximumFractionDigits: 3,
  }).format(amount);
}

export function formatUnitPrice(unitPrice: number): string {
  if (unitPrice < 1) {
    return `$${unitPrice.toFixed(2)}/u`;
  }
  return `$${unitPrice.toFixed(2)}/u`;
}

export function calculateMarginPercentage(sellingPrice: number, totalCost: number): number {
  if (sellingPrice <= 0) return 0;
  return ((sellingPrice - totalCost) / sellingPrice) * 100;
}

export function inchesToCm(inches: number): number {
  return Number((inches * 2.54).toFixed(2));
}
