import React, { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const storedCart = localStorage.getItem('cart');
    return storedCart ? JSON.parse(storedCart) : [];
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) setCart(JSON.parse(storedCart));
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);


  // Add to cart handler
  const addToCart = (product) => {
    const productWithDescription = {
      ...product,
      description: product.description || '',
    };
    const productId = product._id || product.id;
    setCart(prevCart => {
      const existing = prevCart.find(item => (item._id || item.id) === productId);
      if (existing) {
        // Only add if not at stock limit
        if (existing.quantity < (product.stock || 99)) {
          return prevCart.map(item =>
            (item._id || item.id) === productId ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          return prevCart;
        }
      } else {
        return [...prevCart, { ...productWithDescription, quantity: 1, _id: productId }];
      }
    });
  };

  // Increment quantity (max: stock)
  const incrementQuantity = (productId, stock = 99) => {
    setCart(prevCart => prevCart.map(item =>
      (item._id || item.id) === productId && item.quantity < (item.stock || stock)
        ? { ...item, quantity: item.quantity + 1 }
        : item
    ));
  };

  // Decrement quantity (min: 1)
  const decrementQuantity = (productId) => {
    setCart(prevCart => prevCart.map(item =>
      (item._id || item.id) === productId && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    ));
  };


  // Remove from cart handler
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => (item._id || item.id) !== productId));
  };

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
  };

  // Get total cart count
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartCount, incrementQuantity, decrementQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
