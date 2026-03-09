'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  category?: string;
  isGift?: boolean;
}

interface CartContextType {
  cartItems: CartItem[];
  displayItems: CartItem[];
  addToCart: (product: { id: string; name: string; image: string; price: number; category?: string }) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  hasFoodItem: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage once on initial mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (err) {
        console.error('Error parsing cart data:', err);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes, but only after initialization
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized]);

  const hasFoodItem = useMemo(() => {
    return cartItems.some(item => item.category === 'food');
  }, [cartItems]);

  // displayItems includes the auto-injected free water bottle
  const displayItems = useMemo(() => {
    if (hasFoodItem) {
      const waterBottle: CartItem = {
        id: 'free-water-bottle',
        name: 'Complimentary Bottled Water',
        image: '/assets/images/water-bottle.jpg',
        price: 0,
        quantity: 1,
        isGift: true,
        category: 'reward'
      };
      return [...cartItems, waterBottle];
    }
    return cartItems;
  }, [cartItems, hasFoodItem]);

  const addToCart = (product: { id: string; name: string; image: string; price: number; category?: string }) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      displayItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      hasFoodItem
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
