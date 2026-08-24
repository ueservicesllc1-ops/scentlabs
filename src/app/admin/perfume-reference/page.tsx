import React from 'react';
import { referenceRepository } from '@/lib/firestore/reference';
import { ImporterControls } from './ImporterControls';
import { ReferenceCard } from './ReferenceCard';
import { Search } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PerfumeReferenceDatabasePage({
  searchParams,
}: {
  searchParams: { q?: string; brand?: string };
}) {
  const { items, total } = await referenceRepository.queryReferenceProducts({
    limit: 50,
    brand: searchParams.brand,
  });

  // Simple client-side search approximation for the UI since Firestore full-text is complex
  // In a real app we'd use Algolia or Typesense
  const query = searchParams.q?.toLowerCase() || '';
  const displayItems = query 
    ? items.filter(i => i.fullName.toLowerCase().includes(query) || i.brand.toLowerCase().includes(query))
    : items;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Perfume Reference Database</h1>
        <p className="mt-1 text-sm text-gray-500">
          Internal database of source products from FragranceNet. Added products will be copied to your catalog as drafts.
        </p>
      </div>

      <ImporterControls />

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <form>
              <input 
                type="text" 
                name="q"
                defaultValue={searchParams.q}
                placeholder="Search reference DB..." 
                className="pl-9 pr-4 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black w-64"
              />
            </form>
          </div>
          <form>
            <input 
              type="text" 
              name="brand"
              defaultValue={searchParams.brand}
              placeholder="Filter by brand..." 
              className="px-4 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black w-48"
            />
          </form>
        </div>
        <div className="text-sm text-gray-500">
          Showing <span className="font-semibold text-gray-900">{displayItems.length}</span> / {total} total
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {displayItems.map(product => (
          <ReferenceCard key={product.id} product={product} />
        ))}
        {displayItems.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-500 border border-gray-200 bg-gray-50">
            No reference products found. Try running the importer or adjusting filters.
          </div>
        )}
      </div>
    </div>
  );
}
