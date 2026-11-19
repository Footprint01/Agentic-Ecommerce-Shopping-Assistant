import React from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../services/productDatabase';
import { motion, AnimatePresence } from 'framer-motion';

export const CartDrawer: React.FC = () => {
  const { items, isOpen, toggleCart, updateQuantity, removeItem, total, currency } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-slate-900 shadow-2xl sm:max-w-lg border-l border-slate-800"
          >
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/50 backdrop-blur">
              <h2 className="text-lg font-semibold text-slate-100">Shopping Cart</h2>
              <button
                onClick={toggleCart}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-700">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-4 rounded-full bg-slate-800 p-6 shadow-inner">
                    <ShoppingBag className="h-10 w-10 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-200">Your cart is empty</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Ask the AI Assistant to find something for you!
                  </p>
                  <button
                    onClick={toggleCart}
                    className="mt-6 rounded-full bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
                  >
                    Back to Chat
                  </button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-4 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-slate-700 bg-white">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-medium text-slate-200 line-clamp-1 text-sm">{item.title}</h3>
                            <p className="text-sm font-bold text-emerald-400 whitespace-nowrap">
                              {formatPrice(item.price * item.quantity, currency)}
                            </p>
                          </div>
                          <p className="text-xs text-slate-500">{item.brand}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 bg-slate-900 rounded-lg border border-slate-700 p-0.5">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="rounded-md p-1.5 text-slate-400 hover:text-white hover:bg-slate-700"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-xs font-medium w-6 text-center text-slate-200">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="rounded-md p-1.5 text-slate-400 hover:text-white hover:bg-slate-700"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-slate-500 hover:text-red-400 p-1.5 hover:bg-slate-900 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-slate-800 bg-slate-900 p-6 space-y-4">
                <div className="space-y-2">
                   <div className="flex items-center justify-between text-sm text-slate-400">
                     <span>Subtotal</span>
                     <span>{formatPrice(total(), currency)}</span>
                   </div>
                   <div className="flex items-center justify-between text-sm text-slate-400">
                     <span>Tax (10%)</span>
                     <span>{formatPrice(total() * 0.1, currency)}</span>
                   </div>
                   <div className="flex items-center justify-between text-lg font-bold text-white pt-2 border-t border-slate-800">
                     <span>Total</span>
                     <span className="text-emerald-400">{formatPrice(total() * 1.1, currency)}</span>
                   </div>
                </div>
                <button 
                  onClick={() => {
                    if (confirm(`Proceed to checkout with total ${formatPrice(total() * 1.1, currency)}?`)) {
                      alert('Order placed successfully! Thank you for shopping with AI Shopping Assistant.');
                      useCartStore.getState().items.forEach(i => useCartStore.getState().removeItem(i.id));
                      toggleCart();
                    }
                  }}
                  className="w-full rounded-xl bg-indigo-600 py-3 text-center text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 active:scale-95 transition-all"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
