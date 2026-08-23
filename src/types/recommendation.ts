export interface RecommendationItem {
  targetProductId: string;
  relationshipType: 'label' | 'closure' | 'packaging' | 'tool' | 'ingredient' | 'upsell';
  priority: number;
  customCallout?: string;
}

export interface Recommendation {
  id: string; // source productId
  productId: string;
  items: RecommendationItem[];
  displayCompleteYourProduct: boolean;
  displayYouMayAlsoNeed: boolean;
  updatedAt: string;
}
