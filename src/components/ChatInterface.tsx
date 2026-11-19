import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, ArrowRight, Upload } from 'lucide-react';
import { moltbotAgent, AgentResponse, Product } from '../services/api';
import { useCartStore } from '../store/cartStore';
import { processShoppingListImage } from '../services/ocrService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ProductWidget, WidgetType } from './ProductWidget';
import { motion } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: WidgetType; // Updated from 'widget' to match API structure flattening
  data?: any;
  timestamp: Date;
}

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "👋 **Hello! I'm your AI Shopping Assistant.**\n\nI can find products, compare them, and manage your cart.\n\n**Try asking:**\n- *\"Show me some laptops\"*\n- *\"Compare iPhone X and iPhone 9\"*\n- *\"Add a perfume to my cart\"*\n- *Upload a shopping list image!*",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastProducts, setLastProducts] = useState<Product[]>([]); 
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Connect to Store
  const { items: cartItems, addItem, toggleCart, currency } = useCartStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleAction = (response: AgentResponse) => {
    if (response.systemAction) {
      const { type } = response.systemAction;
      switch (type) {
        case 'ADD_TO_CART':
          // Payload is already added via callback in agent, but if we needed UI feedback:
          break;
        case 'OPEN_CART':
           // Use a small timeout to let the UI settle
           setTimeout(() => {
             // If cart is closed, open it. 
             // Ideally check state but toggle works for now or direct set
             // toggleCart(); 
             // Actually, let's just assume toggle opens it.
             // Accessing store directly inside component is safer
             useCartStore.getState().isOpen || toggleCart(); 
           }, 500);
          break;
        default:
          break;
      }
    }
  };

  const processResponse = (result: AgentResponse) => {
     // Handle system actions
     handleAction(result);

     // Update context
     if (result.type === 'product-list' && Array.isArray(result.data)) {
        setLastProducts(result.data);
     } else if (result.type === 'product-detail') {
        setLastProducts([result.data]);
     }

     const botMsg: Message = {
       id: (Date.now() + 1).toString(),
       role: 'assistant',
       content: result.text,
       type: result.type,
       data: result.data,
       timestamp: new Date(),
     };
     setMessages(prev => [...prev, botMsg]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await moltbotAgent(
        userMsg.content, 
        cartItems, 
        addItem, 
        lastProducts
      );
      processResponse(result);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm having trouble connecting to the catalog right now. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `[Uploaded Image: ${file.name}]`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // 1. Process OCR
      const items = await processShoppingListImage(file);
      
      // 2. Send to Agent with special data payload
      const result = await moltbotAgent(
        `I uploaded a shopping list with ${items.length} items.`,
        cartItems,
        addItem,
        lastProducts,
        { ocrItems: items }
      );

      processResponse(result);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I couldn't read that image clearly. Please try uploading a clearer picture of your list.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-slate-900 shadow-2xl overflow-hidden relative">
        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {messages.map((msg) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id} 
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-indigo-600' : 'bg-slate-700'
              }`}>
                {msg.role === 'user' ? <User className="w-6 h-6 text-white" /> : <Bot className="w-6 h-6 text-emerald-400" />}
              </div>
              
              <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-5 py-3 rounded-2xl shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                }`}>
                  <div className="prose prose-invert prose-sm max-w-none break-words">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                          table: ({node, ...props}) => <div className="overflow-x-auto my-2 border border-slate-600 rounded-lg"><table {...props} className="w-full text-left text-sm" /></div>,
                          th: ({node, ...props}) => <th {...props} className="bg-slate-900 p-2 border-b border-slate-600 font-bold" />,
                          td: ({node, ...props}) => <td {...props} className="p-2 border-b border-slate-700/50" />,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
                
                {/* Render Widgets (Product Cards, etc.) */}
                {msg.type && (
                  <div className="mt-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <ProductWidget type={msg.type} payload={msg.data} />
                  </div>
                )}
                
                <span className="text-[10px] text-slate-500 mt-1 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
             <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10 animate-pulse">
                  <Bot className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="bg-slate-800 px-5 py-3 rounded-2xl rounded-tl-none border border-slate-700 flex gap-2 items-center shadow-lg">
                  <span className="text-xs font-medium text-emerald-400 animate-pulse uppercase tracking-wider">AI Assistant is thinking...</span>
                </div>
             </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-900/90 backdrop-blur border-t border-slate-800">
          <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto flex items-center gap-3">
             <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
                title="Upload Shopping List (Image)"
             >
                <Upload className="w-5 h-5" />
             </button>
             <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*"
             />

             <input
               type="text"
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder={`Ask about products in ${currency}...`}
               className="flex-1 bg-slate-800 text-slate-100 placeholder-slate-400 border border-slate-700 rounded-full px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
             />
             <button 
               type="submit" 
               disabled={!input.trim() || isTyping}
               className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white p-4 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/30"
             >
               {isTyping ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight className="w-5 h-5" />}
             </button>
          </form>
          <div className="text-center mt-2 flex justify-center items-center gap-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">AI Shopping Assistant</p>
          </div>
        </div>
    </div>
  );
};
