import React, { createContext, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [tempCart, setTempCart] = useState([]);

  const addCarritoTemp = (nombre, precio, productId, quantity) => {
    setTempCart(prevCart => {
      const existingProduct = prevCart.find(item => item.productId === productId);
      if (existingProduct) {
        return prevCart.map(item => 
          item.productId === productId 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { productId, nombre, precio, quantity }];
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
