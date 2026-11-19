import React, { useState } from 'react';
import { ShoppingCart, Search, Menu, X } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

interface HeaderProps {
  onSearch: (query: string) => void;
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch, onMenuClick }) => {
  const { items, toggleCart } = useCartStore();
  const [searchValue, setSearchValue] = useState('');
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  const handleClearSearch = () => {
    setSearchValue('');
    onSearch('');
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuClick}
            className="p-2 -ml-2 hover:bg-slate-100 rounded-full lg:hidden transition-colors"
          >
            <Menu className="h-6 w-6 text-slate-600" />
          </button>
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200 transition-transform group-hover:scale-105">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent hidden sm:inline-block">AgentStore</span>
          </div>
        </div>

        <div className="flex-1 max-w-2xl">
          <form onSubmit={handleSearchSubmit} className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              name="search"
              type="text"
              placeholder="Search products..."
              className="block w-full rounded-2xl border-0 bg-slate-100/50 py-3.5 pl-11 pr-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all hover:bg-slate-100 hover:ring-slate-300"
            />
            {searchValue && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </form>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleCart}
            className="relative flex h-12 w-12 items-center justify-center rounded-full hover:bg-slate-100 transition-colors group"
          >
            <ShoppingCart className="h-6 w-6 text-slate-600 group-hover:text-indigo-600 transition-colors" />
            {itemCount > 0 && (
              <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-[10px] font-bold text-white shadow-md ring-2 ring-white animate-in zoom-in">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
