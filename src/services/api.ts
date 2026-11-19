import { 
  initializeProductDatabase, 
  searchDatabase, 
  Product
} from './productDatabase';

// Re-export Product type for compatibility
export type { Product };

export interface AgentResponse {
  text: string;
  data?: any;
  type?: 'product-list' | 'product-detail' | 'comparison' | 'cart-summary';
  systemAction?: {
    type: 'ADD_TO_CART' | 'OPEN_CART' | 'CLEAR_CART';
    payload?: any;
  };
}

// Synonyms map to help the agent understand user intent
const CATEGORY_SYNONYMS: Record<string, string> = {
  'phone': 'mobile phones',
  'phones': 'mobile phones',
  'mobile': 'mobile phones',
  'laptop': 'laptops',
  'computer': 'laptops',
  'fashion': 'clothing',
  'clothes': 'clothing',
  'wear': 'clothing',
  'food': 'groceries',
  'grocery': 'groceries',
  'item': '',
  'items': '',
  'product': '',
  'products': '',
  'electronic': 'electronics',
  'gadget': 'electronics',
  'meds': 'medicines',
  'drug': 'medicines',
  'pill': 'medicines',
  'decoration': 'home_decor',
  'decor': 'home_decor',
  'game': 'gaming',
  'sport': 'sports',
  'gym': 'sports',
  'book': 'books',
  'toy': 'toys',
  'shoe': 'footwear',
  'sneaker': 'footwear',
  'cook': 'kitchen',
  'kitchenware': 'kitchen',
  'pen': 'stationery',
  'paper': 'stationery',
  'dog': 'pets',
  'cat': 'pets',
  'pet': 'pets',
  'ring': 'jewelry',
  'jewel': 'jewelry'
};

const cleanSearchQuery = (query: string): string => {
  let cleaned = query.toLowerCase();
  
  // Remove common conversational prefixes/suffixes
  const stopPhrases = [
    'show me', 'can you show me', 'i want', 'i need', 'looking for', 'find me', 'search for', 
    'do you have', 'give me', 'display', 'list', 'are there any', 'some'
  ];
  
  stopPhrases.forEach(phrase => {
    cleaned = cleaned.replace(phrase, '');
  });

  // Remove common stop words
  cleaned = cleaned.replace(/\b(a|an|the|some|any|items|products)\b/g, '');

  // Trim and reduce spaces
  cleaned = cleaned.trim().replace(/\s+/g, ' ');

  // Check synonyms
  const words = cleaned.split(' ');
  const mappedWords = words.map(w => CATEGORY_SYNONYMS[w] !== undefined ? CATEGORY_SYNONYMS[w] : w);
  
  return mappedWords.join(' ').trim();
};

export const moltbotAgent = async (
  message: string, 
  cartItems: any[], 
  addToCartCallback: (p: Product) => void,
  lastProducts: Product[] = [],
  data?: { ocrItems?: string[] }
): Promise<AgentResponse> => {
  const lowerMsg = message.toLowerCase();
  
  // Initialize DB if not already (lazy load)
  await initializeProductDatabase();

  // 0. Handle OCR Data
  if (data?.ocrItems && data.ocrItems.length > 0) {
      const foundProducts: Product[] = [];
      const notFound: string[] = [];

      for (const item of data.ocrItems) {
          // Try exact search first, then cleaned search
          let results = searchDatabase(item);
          if (results.length === 0) {
             results = searchDatabase(cleanSearchQuery(item));
          }

          if (results.length > 0) {
              foundProducts.push(results[0]); // Take top match
          } else {
              notFound.push(item);
          }
      }

      foundProducts.forEach(p => addToCartCallback(p));

      let responseText = `I processed your shopping list.\n\n`;
      if (foundProducts.length > 0) {
          responseText += `✅ **Added to Cart**:\n${foundProducts.map(p => `- ${p.title}`).join('\n')}\n\n`;
      }
      if (notFound.length > 0) {
          responseText += `❌ **Not Found**:\n${notFound.map(i => `- ${i}`).join('\n')}`;
      }

      return {
          text: responseText,
          type: 'product-list',
          data: foundProducts,
          systemAction: { type: 'OPEN_CART' }
      };
  }

  // 1. Handle "Add to Cart" with Context
  if (lowerMsg.includes('add') && (lowerMsg.includes('cart') || lowerMsg.includes('it') || lowerMsg.includes('this'))) {
    // Check if user specified a product by name
    const allProducts = searchDatabase(''); 
    const namedProduct = allProducts.find(p => lowerMsg.includes(p.title.toLowerCase()));

    let targetProduct = namedProduct;

    // If no specific name found, check context
    if (!targetProduct) {
        if (lowerMsg.includes('first') || lowerMsg.includes('1st')) {
            targetProduct = lastProducts[0];
        } else if (lowerMsg.includes('second') || lowerMsg.includes('2nd')) {
            targetProduct = lastProducts[1];
        } else if (lastProducts.length > 0) {
            targetProduct = lastProducts[0];
        }
    }

    if (targetProduct) {
      addToCartCallback(targetProduct);
      return {
        text: `✅ Added **${targetProduct.title}** to your cart.`,
        systemAction: { type: 'ADD_TO_CART', payload: targetProduct }
      };
    } else {
        return { text: "I'm not sure which product you want to add. Please specify the name or search for something first." };
    }
  }

  // 2. Handle Cart / Billing
  if (lowerMsg.includes('cart') || lowerMsg.includes('bill') || lowerMsg.includes('checkout') || lowerMsg.includes('total')) {
    if (cartItems.length === 0) {
      return { text: "Your cart is currently empty." };
    }
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return {
      text: `## Cart Summary\nYou have ${cartItems.length} items.\n\n**Total Value: $${total.toFixed(2)}**\n\nReady to checkout?`,
      type: 'cart-summary',
      data: cartItems,
      systemAction: { type: 'OPEN_CART' }
    };
  }

  // 3. Handle Comparisons
  if (lowerMsg.includes('compare')) {
    const cleanedQuery = cleanSearchQuery(message.replace('compare', ''));
    const products = searchDatabase(cleanedQuery);
    
    // If specific search failed, try just searching for the first two words as separate items
    let comparisonList = products;
    if (products.length < 2) {
         // Fallback logic could go here
    }

    if (comparisonList.length >= 2) {
      const toCompare = comparisonList.slice(0, 3);
      
      const tableHeader = `| Feature | ${toCompare.map(p => p.title.substring(0, 15) + '...').join(' | ')} |`;
      const tableDivider = `|---|${toCompare.map(() => '---').join('|')}|`;
      const rows = [
        `| Price | ${toCompare.map(p => `$${p.price}`).join(' | ')} |`,
        `| Rating | ${toCompare.map(p => `${p.rating} ⭐`).join(' | ')} |`,
        `| Brand | ${toCompare.map(p => p.brand).join(' | ')} |`,
        `| Category | ${toCompare.map(p => p.category).join(' | ')} |`
      ];

      return {
        text: `Here is the comparison:\n\n${tableHeader}\n${tableDivider}\n${rows.join('\n')}`,
        type: 'comparison',
        data: toCompare
      };
    }
  }

  // 4. Handle "Show Details"
  if (lowerMsg.includes('detail') || lowerMsg.includes('about')) {
      const cleanedQuery = cleanSearchQuery(message.replace('tell me about', '').replace('details', ''));
      const results = searchDatabase(cleanedQuery);
      if (results.length > 0) {
          return {
              text: `Here are the details for **${results[0].title}**:`,
              type: 'product-detail',
              data: results[0]
          };
      }
  }

  // 5. Default: Search
  // First try raw search (in case they typed a specific model name)
  let results = searchDatabase(message);

  // If raw search yields nothing, try cleaned search
  if (results.length === 0) {
    const cleaned = cleanSearchQuery(message);
    if (cleaned.length > 0) {
        results = searchDatabase(cleaned);
    }
  }
  
  // If still nothing, and query was short, maybe try broad match or suggest categories
  if (results.length === 0) {
      // Last ditch: search by words individually
      const words = cleanSearchQuery(message).split(' ');
      for (const word of words) {
          if (word.length > 3) {
              const partial = searchDatabase(word);
              if (partial.length > 0) {
                  results = partial;
                  break;
              }
          }
      }
  }

  if (results.length === 0) {
    return { text: `I couldn't find anything for "${message}". Try browsing categories like Electronics, Groceries, or Fashion.` };
  }

  return {
    text: `Found ${results.length} products matching your request.`,
    type: 'product-list',
    data: results.slice(0, 10) 
  };
};
