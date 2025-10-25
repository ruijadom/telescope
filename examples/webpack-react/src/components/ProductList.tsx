import React, { useState } from 'react';
import ProductCard from './ProductCard';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
}

function ProductList() {
  const [products] = useState<Product[]>([
    {
      id: 1,
      name: 'React Hubble Pro',
      price: 49.99,
      description: 'Professional developer tool for React component navigation',
      image: 'https://via.placeholder.com/300x200'
    },
    {
      id: 2,
      name: 'Component Inspector',
      price: 29.99,
      description: 'Inspect and analyze React components in real-time',
      image: 'https://via.placeholder.com/300x200'
    },
    {
      id: 3,
      name: 'Test ID Generator',
      price: 19.99,
      description: 'AI-powered test ID generation for your components',
      image: 'https://via.placeholder.com/300x200'
    }
  ]);

  const [cart, setCart] = useState<number[]>([]);

  const handleAddToCart = (productId: number) => {
    setCart([...cart, productId]);
    alert('Product added to cart!');
  };

  return (
    <div className="product-list">
      <div className="cart-info">
        <span>Cart Items: {cart.length}</span>
        <button>View Cart</button>
      </div>
      
      <div className="products-grid">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
    </div>
  );
}

export default ProductList;
