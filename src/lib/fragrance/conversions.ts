import { VolumeUnit } from "@/types/fragrance";

const ML_PER_FL_OZ = 29.5735;
const FL_OZ_PER_GALLON = 128.0;
const GRAMS_PER_POUND = 453.59237;

/**
 * Converts any supported unit to fluid ounces (oz).
 * Strictly requires specific gravity density (g/ml) when converting from weight units (lb).
 */
export function convertToOunces(
  quantity: number,
  unit: VolumeUnit,
  densityGramsPerMl?: number
): { ounces: number; requiresDensity?: boolean; error?: string } {
  if (quantity <= 0) return { ounces: 0 };

  switch (unit) {
    case "oz":
      return { ounces: quantity };

    case "gallon":
      return { ounces: Math.round(quantity * FL_OZ_PER_GALLON * 1000) / 1000 };

    case "ml":
      return { ounces: Math.round((quantity / ML_PER_FL_OZ) * 1000) / 1000 };

    case "liter":
      return { ounces: Math.round(((quantity * 1000) / ML_PER_FL_OZ) * 1000) / 1000 };

    case "lb":
      if (!densityGramsPerMl || densityGramsPerMl <= 0) {
        return {
          ounces: 0,
          requiresDensity: true,
          error: "Weight to volume conversion (lb to oz) requires specific gravity density (g/ml).",
        };
      }
      // Weight (lb) -> Grams -> Volume (ml) -> Fluid Ounces
      const totalGrams = quantity * GRAMS_PER_POUND;
      const totalMl = totalGrams / densityGramsPerMl;
      const totalOunces = totalMl / ML_PER_FL_OZ;
      return { ounces: Math.round(totalOunces * 1000) / 1000 };

    default:
      return { ounces: quantity };
  }
}

/**
 * Calculates raw cost per fluid ounce from source container purchase.
 */
export function calculateCostPerOz(
  sourceQuantity: number,
  sourceUnit: VolumeUnit,
  sourceCost: number,
  densityGramsPerMl?: number
): { costPerOz: number; costPerMl: number; totalOunces: number; error?: string } {
  if (sourceQuantity <= 0 || sourceCost <= 0) {
    return { costPerOz: 0, costPerMl: 0, totalOunces: 0 };
  }

  const conversion = convertToOunces(sourceQuantity, sourceUnit, densityGramsPerMl);

  if (conversion.requiresDensity || conversion.error) {
    return {
      costPerOz: 0,
      costPerMl: 0,
      totalOunces: 0,
      error: conversion.error,
    };
  }

  const totalOunces = conversion.ounces;
  const costPerOz = Math.round((sourceCost / totalOunces) * 10000) / 10000;
  const costPerMl = Math.round((costPerOz / ML_PER_FL_OZ) * 10000) / 10000;

  return {
    costPerOz,
    costPerMl,
    totalOunces,
  };
}
