import React from 'react';
import { Product } from '../services/api';
import { useCartStore } from '../store/cartStore';
import { Plus, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ring-1 ring-slate-100/50"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="h-full w-full object-contain p-4 transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-rose-500 shadow-sm backdrop-blur-md ring-1 ring-black/5">
          -{Math.round(product.discountPercentage)}%
        </div>
        
        {/* Quick Add Overlay on Desktop */}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 hidden lg:block bg-gradient-to-t from-black/40 to-transparent">
           <button
            onClick={(e) => {
              e.stopPropagation();
              addItem(product);
            }}
            className="w-full transform rounded-xl bg-white py-3 text-sm font-bold text-slate-900 shadow-lg hover:bg-indigo-50 active:scale-95 transition-all translate-y-2 group-hover:translate-y-0"
          >
            Add to Cart
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between">
          <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
            {product.category}
          </span>
          <div className="flex items-center gap-1 text-sm font-bold text-amber-400">
            <Star className="h-4 w-4 fill-current" />
            {product.rating}
          </div>
        </div>
        
        <h3 className="mb-2 text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors" title={product.title}>
          {product.title}
        </h3>
        
        <p className="mb-4 text-sm text-slate-500 line-clamp-2 flex-1 leading-relaxed">
          {product.description}
        </p>
        
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Price</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-xs font-medium text-slate-400 line-through">
                ${(product.price / (1 - product.discountPercentage / 100)).toFixed(2)}
              </span>
            </div>
          </div>
          <button
            onClick={() => addItem(product)}
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white transition-colors hover:bg-indigo-600 active:scale-95 shadow-md"
            aria-label="Add to cart"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
