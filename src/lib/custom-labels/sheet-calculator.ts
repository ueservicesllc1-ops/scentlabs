import { BASE_SHEET_CONFIG } from "@/config/custom-labels";
import { LabelSheetYield } from "@/types/custom-label";

/**
 * Calculates optimal label yields per 8.5 x 11" production sheet taking spacing and bleed into account.
 */
export function calculateLabelSheetYield(
  labelWidth: number,
  labelHeight: number,
  quantity: number = 100,
  spacing: number = BASE_SHEET_CONFIG.defaultSpacing,
  bleed: number = BASE_SHEET_CONFIG.defaultBleed,
  sheetWidth: number = BASE_SHEET_CONFIG.sheetWidth,
  sheetHeight: number = BASE_SHEET_CONFIG.sheetHeight
): LabelSheetYield {
  const effectiveWidth = labelWidth + spacing + bleed * 2;
  const effectiveHeight = labelHeight + spacing + bleed * 2;

  // Portrait layout
  const colsPortrait = Math.floor(sheetWidth / effectiveWidth);
  const rowsPortrait = Math.floor(sheetHeight / effectiveHeight);
  const labelsPerSheetPortrait = Math.max(1, colsPortrait * rowsPortrait);

  // Landscape layout
  const colsLandscape = Math.floor(sheetWidth / effectiveHeight);
  const rowsLandscape = Math.floor(sheetHeight / effectiveWidth);
  const labelsPerSheetLandscape = Math.max(1, colsLandscape * rowsLandscape);

  const optimalLabelsPerSheet = Math.max(labelsPerSheetPortrait, labelsPerSheetLandscape);
  const optimalOrientation = labelsPerSheetLandscape > labelsPerSheetPortrait ? "landscape" : "portrait";
  const estimatedSheetsRequired = Math.ceil(quantity / optimalLabelsPerSheet);

  return {
    sheetWidth,
    sheetHeight,
    labelWidth,
    labelHeight,
    spacing,
    bleed,
    labelsPerSheetPortrait,
    labelsPerSheetLandscape,
    optimalLabelsPerSheet,
    optimalOrientation,
    estimatedSheetsRequired,
  };
}
