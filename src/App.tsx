import { ChatInterface } from './components/ChatInterface';
import { CartDrawer } from './components/CartDrawer';
import { useCartStore } from './store/cartStore';

export function App() {
  // We keep the cart drawer for "viewing" the cart, but the main interaction is chat
  // We can pass a prop to ChatInterface to toggle the drawer if needed
  
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden flex flex-col">
      {/* Minimal Header / Branding */}
      <header className="flex-none h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <span className="text-xl font-bold text-slate-100 tracking-tight">AI Shopping Assistant</span>
        </div>
        <div className="flex items-center gap-4">
           <CurrencyToggle />
           {/* Cart Trigger */}
           <CartTrigger />
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 relative overflow-hidden">
        <ChatInterface />
      </main>

      <CartDrawer />
    </div>
  );
}

function CartTrigger() {
  const { items, toggleCart } = useCartStore();
  const count = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <button 
      onClick={toggleCart}
      className="relative p-2 hover:bg-slate-800 rounded-full transition-colors"
      title="View Cart"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
      {count > 0 && (
        <span className="absolute top-0 right-0 h-5 w-5 bg-indigo-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white ring-2 ring-slate-900">
          {count}
        </span>
      )}
    </button>
  );
}

function CurrencyToggle() {
  const { currency, setCurrency } = useCartStore();
  
  return (
    <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
      <button 
        onClick={() => setCurrency('USD')}
        className={`px-3 py-1 rounded text-xs font-bold transition-all ${currency === 'USD' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
      >
        USD
      </button>
      <button 
        onClick={() => setCurrency('INR')}
        className={`px-3 py-1 rounded text-xs font-bold transition-all ${currency === 'INR' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
      >
        INR
      </button>
    </div>
  );
}
