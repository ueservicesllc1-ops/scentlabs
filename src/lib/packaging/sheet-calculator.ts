export interface SheetCalculationParams {
  sheetWidth?: number; // default 8.5"
  sheetHeight?: number; // default 11.0"
  boxWidth: number; // in inches
  boxHeight: number;
  boxDepth: number;
  glueTabWidth?: number; // default 0.5"
  tuckTabHeight?: number; // default 0.625"
  spacing?: number; // default 0.125" cut spacing
  bleed?: number; // default 0.0625"
}

export interface SheetCalculationResult {
  flatNetWidth: number;
  flatNetHeight: number;
  boxesPerSheetPortrait: number;
  boxesPerSheetLandscape: number;
  optimalBoxesPerSheet: number;
  sheetsRequiredPerBox: number;
  optimalOrientation: "portrait" | "landscape";
  estimatedWastePercent: number;
}

/**
 * Calculates unfolded box footprint and sheet yield on Cricut cardstock sheets.
 */
export function calculateSheetsRequired(params: SheetCalculationParams): SheetCalculationResult {
  const {
    sheetWidth = 8.5,
    sheetHeight = 11.0,
    boxWidth,
    boxHeight,
    boxDepth,
    glueTabWidth = 0.5,
    tuckTabHeight = 0.625,
    spacing = 0.125,
    bleed = 0.0625,
  } = params;

  // Unfolded 3D box flat die-cut net dimensions
  const flatNetWidth = 2 * boxWidth + 2 * boxDepth + glueTabWidth + spacing + bleed * 2;
  const flatNetHeight = boxHeight + 2 * boxDepth + tuckTabHeight * 2 + spacing + bleed * 2;

  // Portrait yield
  const colsPortrait = Math.floor(sheetWidth / flatNetWidth);
  const rowsPortrait = Math.floor(sheetHeight / flatNetHeight);
  const boxesPerSheetPortrait = colsPortrait * rowsPortrait;

  // Landscape yield
  const colsLandscape = Math.floor(sheetWidth / flatNetHeight);
  const rowsLandscape = Math.floor(sheetHeight / flatNetWidth);
  const boxesPerSheetLandscape = colsLandscape * rowsLandscape;

  const optimalBoxesPerSheet = Math.max(boxesPerSheetPortrait, boxesPerSheetLandscape);
  const optimalOrientation = boxesPerSheetLandscape > boxesPerSheetPortrait ? "landscape" : "portrait";

  // If a single box requires more than 1 sheet (or 1 full sheet)
  const sheetsRequiredPerBox =
    optimalBoxesPerSheet >= 1 ? Math.round((1 / optimalBoxesPerSheet) * 1000) / 1000 : Math.ceil(flatNetWidth / sheetWidth) * Math.ceil(flatNetHeight / sheetHeight);

  // Approximate area waste
  const sheetArea = sheetWidth * sheetHeight;
  const usedArea = (boxWidth * boxHeight * 2 + boxWidth * boxDepth * 2 + boxHeight * boxDepth * 2) * Math.max(1, optimalBoxesPerSheet);
  const estimatedWastePercent = Math.max(5, Math.min(60, Math.round(((sheetArea - usedArea) / sheetArea) * 100)));

  return {
    flatNetWidth: Math.round(flatNetWidth * 100) / 100,
    flatNetHeight: Math.round(flatNetHeight * 100) / 100,
    boxesPerSheetPortrait,
    boxesPerSheetLandscape,
    optimalBoxesPerSheet: Math.max(1, optimalBoxesPerSheet),
    sheetsRequiredPerBox: Math.max(0.2, sheetsRequiredPerBox),
    optimalOrientation,
    estimatedWastePercent,
  };
}
