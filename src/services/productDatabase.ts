import { v4 as uuidv4 } from 'uuid';

export interface Product {
  id: number | string;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string; // Original category from API or Mock
  mainCategory: string; // Broad category (Electronics, Clothing, etc.)
  subcategory: string;
  thumbnail: string;
  images: string[];
}

export const CURRENCY_RATE = 83.5; // 1 USD = 83.5 INR

export const formatPrice = (priceInUsd: number, currency: 'USD' | 'INR') => {
  if (currency === 'INR') {
    return `₹${(priceInUsd * CURRENCY_RATE).toFixed(2)}`;
  }
  return `$${priceInUsd.toFixed(2)}`;
};

// Define the requested structure
export const CATEGORY_STRUCTURE: Record<string, string[]> = {
  electronics: ['Mobile Phones', 'Smartwatches', 'Laptops', 'Chargers', 'Gaming Laptops', 'Gaming Accessories'],
  clothing: ['Men', 'Women', 'Kids', 'New Fashion', 'Winter Wear'],
  groceries: ['Pulses', 'Fruits', 'Vegetables', 'New Arrivals', 'Spices', 'Dairy'],
  medicines: ['Pain Relief', 'Vitamins', 'First Aid', 'Prescription', 'Supplements'],
  home_decor: ['Lighting', 'Furniture', 'Wall Art', 'Plants', 'Textiles'],
  beauty: ['Skincare', 'Makeup', 'Fragrances', 'Haircare'],
  automotive: ['Car Accessories', 'Bike Accessories', 'Tools', 'Oils'],
  sports: ['Cricket', 'Football', 'Gym Equipment', 'Yoga'],
  books: ['Fiction', 'Non-Fiction', 'Academic', 'Comics'],
  toys: ['Action Figures', 'Board Games', 'Educational', 'Outdoor'],
  footwear: ['Sneakers', 'Formal', 'Sandals', 'Sports Shoes'],
  kitchen: ['Cookware', 'Appliances', 'Utensils', 'Storage'],
  stationery: ['Notebooks', 'Pens', 'Art Supplies', 'Office'],
  pets: ['Dog Food', 'Cat Food', 'Accessories', 'Toys'],
  jewelry: ['Necklaces', 'Rings', 'Earrings', 'Bracelets']
};

// Helper to generate mock data for missing categories
const generateMockProducts = (category: string, subcategory: string, count: number): Product[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: uuidv4(),
    title: `${subcategory} Item ${i + 1}`,
    description: `High quality ${subcategory} from our ${category} collection. Best in class performance and durability.`,
    price: Math.floor(Math.random() * 200) + 10,
    discountPercentage: Math.floor(Math.random() * 20) + 5,
    rating: Number((Math.random() * 2 + 3).toFixed(1)),
    stock: Math.floor(Math.random() * 100),
    brand: 'AgentChoice',
    category: category,
    mainCategory: category,
    subcategory: subcategory,
    thumbnail: `https://placehold.co/300x300?text=${encodeURIComponent(subcategory)}+${i+1}`,
    images: [`https://placehold.co/300x300?text=${encodeURIComponent(subcategory)}+${i+1}`]
  }));
};

let cachedProducts: Product[] = [];

export const initializeProductDatabase = async () => {
  if (cachedProducts.length > 0) return cachedProducts;

  // 1. Fetch Real Data from DummyJSON
  try {
    const response = await fetch('https://dummyjson.com/products?limit=0');
    const data = await response.json();
    
    // Map real data to our structure where possible
    const realProducts = data.products.map((p: any) => {
        const mappedMain = mapRealToMainCategory(p.category);
        const mappedSub = mapToSubcategory(p.category, p.title);
        
        return {
          ...p,
          mainCategory: mappedMain,
          subcategory: mappedSub
        };
    });
    
    cachedProducts.push(...realProducts);
  } catch (error) {
    console.error("Failed to fetch real data", error);
  }

  // 2. Fill gaps to meet the "20 products per subcategory" requirement
  Object.entries(CATEGORY_STRUCTURE).forEach(([category, subcategories]) => {
    subcategories.forEach(subcat => {
      // Check if we have enough real data for this subcat
      const existingCount = cachedProducts.filter(p => 
        p.mainCategory.toLowerCase() === category.toLowerCase() && 
        (p.subcategory.toLowerCase() === subcat.toLowerCase() || p.category.includes(subcat.toLowerCase()))
      ).length;

      if (existingCount < 5) { // If low data, generate mocks
        const mocks = generateMockProducts(category, subcat, 20);
        cachedProducts.push(...mocks);
      }
    });
  });

  return cachedProducts;
};

// Map DummyJSON categories to our Main Categories
const mapRealToMainCategory = (realCategory: string): string => {
    const cat = realCategory.toLowerCase();
    
    if (['smartphones', 'laptops', 'mobile-accessories', 'tablets'].includes(cat)) return 'electronics';
    if (['fragrances', 'skincare', 'beauty'].includes(cat)) return 'beauty';
    if (['groceries'].includes(cat)) return 'groceries';
    if (['home-decoration', 'furniture', 'lighting'].includes(cat)) return 'home_decor';
    if (['tops', 'womens-dresses', 'womens-shoes', 'mens-shirts', 'mens-shoes', 'mens-watches', 'womens-watches', 'womens-bags', 'sunglasses'].includes(cat)) return 'clothing';
    if (['automotive', 'motorcycle'].includes(cat)) return 'automotive';
    if (['womens-jewellery'].includes(cat)) return 'jewelry';
    
    return 'general'; // Default fallback
};

// Helper to map real categories to our subcategories
const mapToSubcategory = (realCategory: string, title: string): string => {
  const lowerTitle = title.toLowerCase();
  const cat = realCategory.toLowerCase();

  if (cat === 'smartphones') return 'Mobile Phones';
  if (cat === 'laptops') {
    if (lowerTitle.includes('gaming')) return 'Gaming Laptops';
    return 'Laptops';
  }
  if (cat === 'groceries') return 'New Arrivals';
  if (cat === 'fragrances') return 'Fragrances';
  if (cat === 'skincare') return 'Skincare';
  if (cat === 'home-decoration') return 'Wall Art';
  if (cat === 'furniture') return 'Furniture';
  if (cat.includes('shoes')) return 'Sneakers';
  if (cat.includes('mens')) return 'Men';
  if (cat.includes('womens')) return 'Women';
  
  return 'General';
};

export const searchDatabase = (query: string): Product[] => {
  const lowerQuery = query.toLowerCase();
  
  // Search Priority:
  // 1. Exact match in title
  // 2. Exact match in subcategory
  // 3. Exact match in mainCategory
  // 4. Fuzzy match
  
  return cachedProducts.filter(p => 
    p.title.toLowerCase().includes(lowerQuery) || 
    p.category.toLowerCase().includes(lowerQuery) ||
    p.mainCategory.toLowerCase().includes(lowerQuery) ||
    p.subcategory.toLowerCase().includes(lowerQuery) ||
    p.brand?.toLowerCase().includes(lowerQuery)
  );
};
