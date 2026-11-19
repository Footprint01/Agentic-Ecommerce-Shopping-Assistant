import React from 'react';
import { Product } from '../services/api';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../services/productDatabase';
import { ShoppingCart, Star, Check } from 'lucide-react';

export type WidgetType = 'product-list' | 'product-detail' | 'comparison' | 'cart-summary';

interface ProductWidgetProps {
  type: WidgetType;
  payload: any;
}

export const ProductWidget: React.FC<ProductWidgetProps> = ({ type, payload }) => {
  if (type === 'product-list') {
    return <ProductCarousel products={payload} />;
  }
  if (type === 'product-detail') {
    return <ProductDetail product={payload} />;
  }
  // Comparison tables are handled by Markdown, but we could add a widget here
  return null;
};

const ProductCarousel = ({ products }: { products: Product[] }) => {
  const { addItem, currency } = useCartStore();
  const [addedId, setAddedId] = React.useState<number | string | null>(null);

  const handleAdd = (p: Product) => {
    addItem(p);
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-2 -mx-2 px-2 snap-x">
      {products.map((p) => (
        <div key={p.id} className="min-w-[240px] w-[240px] bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col snap-center shrink-0">
          <div className="h-32 bg-white p-2 relative">
            <img src={p.thumbnail} alt={p.title} className="w-full h-full object-contain" />
            <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              -{Math.round(p.discountPercentage)}%
            </div>
          </div>
          <div className="p-3 flex flex-col flex-1">
            <h4 className="text-slate-100 font-medium text-sm line-clamp-1" title={p.title}>{p.title}</h4>
            <div className="flex items-center gap-1 mt-1 mb-2">
               <Star className="h-3 w-3 text-amber-400 fill-current" />
               <span className="text-xs text-slate-400">{p.rating}</span>
            </div>
            <div className="mt-auto flex items-center justify-between">
              <div className="flex flex-col">
                 <span className="text-lg font-bold text-white">{formatPrice(p.price, currency)}</span>
                 <span className="text-[10px] text-slate-500 line-through">{formatPrice(p.price / (1 - p.discountPercentage/100), currency)}</span>
              </div>
              <button 
                onClick={() => handleAdd(p)}
                className={`p-2 rounded-lg transition-colors ${addedId === p.id ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
              >
                {addedId === p.id ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ProductDetail = ({ product }: { product: Product }) => {
    const { addItem, currency } = useCartStore();
    const [added, setAdded] = React.useState(false);

    const handleAdd = () => {
        addItem(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden max-w-sm mt-2">
            <div className="h-48 bg-white p-4">
                <img src={product.thumbnail} alt={product.title} className="w-full h-full object-contain" />
            </div>
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-white">{product.title}</h3>
                    <div className="bg-slate-700 px-2 py-1 rounded text-xs text-slate-300">{product.brand}</div>
                </div>
                <p className="text-sm text-slate-400 mb-4 line-clamp-3">{product.description}</p>
                
                <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-slate-300">
                    <div className="bg-slate-700/50 p-2 rounded">
                        <span className="block text-slate-500">Rating</span>
                        <div className="flex items-center gap-1 text-amber-400 font-bold">
                            {product.rating} <Star className="h-3 w-3 fill-current" />
                        </div>
                    </div>
                    <div className="bg-slate-700/50 p-2 rounded">
                         <span className="block text-slate-500">Stock</span>
                         <span className="font-bold text-white">{product.stock} units</span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-white">{formatPrice(product.price, currency)}</span>
                        <span className="text-xs text-green-400">{product.discountPercentage}% Discount</span>
                    </div>
                    <button 
                        onClick={handleAdd}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${added ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
                    >
                        {added ? (
                            <>
                                <Check className="h-4 w-4" /> Added
                            </>
                        ) : (
                            <>
                                <ShoppingCart className="h-4 w-4" /> Add to Cart
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
