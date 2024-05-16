import React, { createContext, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [tempCart, setTempCart] = useState([]);

  const addCarritoTemp = (product, quantity) => {
    setTempCart(prevCart => {
      const existingProduct = prevCart.find(item => item.product.id === product.id);
      if (existingProduct) {
        return prevCart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { product, quantity }];
      }
    });
  };

  const clearTempCart = () => {
    setTempCart([]);
  };

  return (
    <CartContext.Provider value={{ tempCart, addCarritoTemp, clearTempCart }}>
      {children}
    </CartContext.Provider>
  );
};
