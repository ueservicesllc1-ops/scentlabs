'use client';

import React, { useState } from 'react';
import { PerfumeReference } from '@/types/reference';
import { addToMyCatalog } from '../api-actions';
import { Check, Plus, ExternalLink } from 'lucide-react';

export function ReferenceCard({ product }: { product: PerfumeReference }) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(product.addedToCatalog);

  const handleAdd = async () => {
    if (added) return;
    try {
      setAdding(true);
      await addToMyCatalog(product.id);
      setAdded(true);
    } catch (err) {
      console.error(err);
      alert('Failed to add to catalog');
    } finally {
      setAdding(false);
    }
  };

  const primaryImage = product.images?.[0]?.b2Url || product.images?.[0]?.sourceImageUrl || (product as any).primaryImageUrl;
  const price = product.variants?.[0]?.sourcePrice;

  return (
    <div className="flex flex-col bg-white border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-square bg-gray-50 border-b border-gray-100 p-4 flex items-center justify-center">
        {primaryImage ? (
          <img 
            src={primaryImage} 
            alt={product.name} 
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain mix-blend-multiply" 
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
              const parent = (e.target as HTMLElement).parentElement;
              if (parent && !parent.querySelector('.fallback-badge')) {
                const badge = document.createElement('div');
                badge.className = 'fallback-badge text-center p-3 text-gray-400 text-xs flex flex-col items-center gap-1';
                badge.innerHTML = '<span class="text-xl">🧴</span><span>' + (product.brand || 'Fragrance') + '</span>';
                parent.appendChild(badge);
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs gap-1">
            <span className="text-2xl">🧴</span>
            <span>{product.brand}</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="flex justify-between items-start">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{product.brand}</p>
            <h3 className="text-sm font-semibold text-gray-900 leading-tight">{product.name}</h3>
          </div>
          {typeof price === 'number' && price > 0 && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-100 rounded-sm">
              ${price.toFixed(2)}
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1 mt-1">
          {product.gender && (
            <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 text-gray-600 uppercase">{product.gender}</span>
          )}
          {product.concentration && (
            <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 text-gray-600 uppercase">{product.concentration}</span>
          )}
        </div>

        <div className="mt-auto pt-4 space-y-2">
          <a 
            href={product.sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" /> View Source on {product.source}
          </a>
          
          <button
            onClick={handleAdd}
            disabled={added || adding}
            className={`w-full py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
              added 
                ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {adding ? (
              'Adding...'
            ) : added ? (
              <><Check className="w-3.5 h-3.5" /> Already in Catalog</>
            ) : (
              <><Plus className="w-3.5 h-3.5" /> Add to My Catalog</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
