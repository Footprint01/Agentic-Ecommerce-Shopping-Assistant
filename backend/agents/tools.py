from langchain_core.tools import tool
import requests
import json

@tool
def search_products(query: str):
    """
    Search for products in the catalog based on a query string.
    Use this tool when the user asks for specific items like 'laptops', 'shoes', etc.
    """
    print(f"DEBUG: Searching for {query}")
    try:
        response = requests.get(f"https://dummyjson.com/products/search?q={query}")
        data = response.json()
        products = data.get('products', [])[:5] # Limit to 5 for context window
        
        # Format the output to be token-efficient but informative
        results = []
        for p in products:
            results.append({
                "id": p['id'],
                "title": p['title'],
                "price": p['price'],
                "rating": p['rating'],
                "description": p['description']
            })
            
        return json.dumps(results)
    except Exception as e:
        return f"Error searching products: {str(e)}"

@tool
def get_categories():
    """
    Get a list of available product categories.
    Use this tool when the user wants to know what kind of items are sold.
    """
    try:
        response = requests.get("https://dummyjson.com/products/categories")
        return json.dumps(response.json())
    except Exception as e:
        return f"Error fetching categories: {str(e)}"

@tool
def get_product_details(product_id: int):
    """
    Get detailed information about a specific product by its ID.
    Use this when the user asks for specific details about a known product.
    """
    try:
        response = requests.get(f"https://dummyjson.com/products/{product_id}")
        return json.dumps(response.json())
    except Exception as e:
        return f"Error getting product details: {str(e)}"

@tool
def compare_products(product_names: str):
    """
    Compare two or more products by searching for them and returning their specs side-by-side.
    Input should be a comma-separated string of product names, e.g., "iPhone 9, Samsung Universe 9".
    """
    names = [n.strip() for n in product_names.split(',')]
    comparison_data = []
    
    for name in names:
        try:
            # Search for the product
            response = requests.get(f"https://dummyjson.com/products/search?q={name}")
            data = response.json()
            products = data.get('products', [])
            
            if products:
                # Take the best match
                p = products[0]
                comparison_data.append({
                    "title": p['title'],
                    "price": p['price'],
                    "rating": p['rating'],
                    "brand": p['brand'],
                    "category": p['category'],
                    "stock": p['stock']
                })
        except Exception:
            continue
            
    return json.dumps(comparison_data)
