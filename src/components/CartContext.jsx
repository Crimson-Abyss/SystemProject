/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [notification, setNotification] = useState('');

  const addToCart = (product) => {
    // Use cartId if provided (includes size info), otherwise fall back to id
    const cartKey = product.cartId || `${product.id}${product.selectedSize ? `-${product.selectedSize}` : ''}`;

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => (item.cartId || item.id) === cartKey);
      if (existingItem) {
        return prevItems.map(item =>
          (item.cartId || item.id) === cartKey ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, cartId: cartKey, quantity: 1 }];
    });
    setNotification('Added to Cart');
    setTimeout(() => {
      setNotification('');
    }, 2000);
  };

  const updateQuantity = (productId, amount) => {
    setCartItems(prevItems => {
      return prevItems.map(item => {
        const key = item.cartId || item.id;
        if (key === productId) {
          const newQuantity = item.quantity + amount;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => (item.cartId || item.id) !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartItemCount,
    notification,
  };

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};