import React from 'react';
import { Product } from '../services/api';
import { ProductCard } from './ProductCard';
import { AnimatePresence } from 'framer-motion';

interface ProductListProps {
  products: Product[];
  isLoading: boolean;
}

export const ProductList: React.FC<ProductListProps> = ({ products, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex h-[360px] flex-col overflow-hidden rounded-xl bg-white shadow-sm border border-slate-100 animate-pulse">
            <div className="h-48 bg-slate-200" />
            <div className="flex-1 p-4 space-y-3">
              <div className="h-4 w-1/3 rounded bg-slate-200" />
              <div className="h-4 w-3/4 rounded bg-slate-200" />
              <div className="h-4 w-full rounded bg-slate-200" />
              <div className="mt-auto flex justify-between pt-4">
                <div className="h-6 w-16 rounded bg-slate-200" />
                <div className="h-8 w-8 rounded-full bg-slate-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-center">
        <p className="text-lg font-medium text-slate-900">No products found</p>
        <p className="text-slate-500">Try adjusting your search terms.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <AnimatePresence>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </AnimatePresence>
    </div>
  );
};
