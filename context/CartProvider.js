import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchCart, addToCart, updateCartItem, removeCartItem } from "@/hooks/useFetch";
import { useGlobalContext } from "@/context/GlobalProvider";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { isLogged } = useGlobalContext();
  const [cart, setCart] = useState({ items: [], total_items: 0 });

  // Load the cart data only if the user is logged in
  const loadCartData = async () => {
    if (!isLogged) return; // Do nothing if not logged in
    try {
      const data = await fetchCart();
      setCart({
        ...data,
        total_items: data.items.length,
      });
      console.log('feres cart: ', data)
    } catch (error) {
      console.error("Failed to load cart data:", error);
    }
  };

  // Run loadCartData when the component mounts or when isLogged changes
  useEffect(() => {
    if (isLogged) {
      loadCartData();
    }
  }, [isLogged]);

  // Add an item to the cart (only if logged in)
  const addItemToCart = async (productId, quantity) => {
    if (!isLogged) return;
    await addToCart(productId, quantity);
    await loadCartData();
  };

  // Update item quantity
  const updateItemQuantity = async (itemId, quantity) => {
    if (!isLogged) return;
    const data = await updateCartItem(itemId, quantity);
    setCart(data);
  };

  // Remove an item from the cart
  const removeItemFromCart = async (itemId) => {
    if (!isLogged) return;
    await removeCartItem(itemId);
    const data = await fetchCart();
    setCart(data);
  };

  return (
    <CartContext.Provider
      value={{ cart, setCart, loadCartData, addItemToCart, updateItemQuantity, removeItemFromCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
