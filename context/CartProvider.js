import React, { createContext, useContext, useState, useEffect } from "react";
import {
  fetchCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  bulkAddToCart,
} from "@/hooks/useFetch";
import { useGlobalContext } from "@/context/GlobalProvider";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { isLogged } = useGlobalContext();
  const [cart, setCart] = useState({ items: [], total_items: 0, total: 0 });
  // Track insertion order of item variation IDs
  const [itemOrder, setItemOrder] = useState([]);

  // Load the cart data only if the user is logged in
  const loadCartData = async () => {
    if (!isLogged) return;
    try {
      const data = await fetchCart();
      // Update cart state
      setCart({
        ...data,
        total_items: Array.isArray(data.items) ? data.items.length : 0,
      });

      // Update insertion order: keep existing IDs first, then any new IDs at the end
      const fetchedIds = Array.isArray(data.items)
        ? data.items.map((item) => item.variations.id)
        : [];
      setItemOrder((prevOrder) => {
        if (prevOrder.length === 0) {
          return fetchedIds;
        }
        // Filter out any removed items, then append new ones
        const existing = prevOrder.filter((id) => fetchedIds.includes(id));
        const added = fetchedIds.filter((id) => !prevOrder.includes(id));
        return [...existing, ...added];
      });

      console.log("👀 fetched cart:", data);
    } catch (error) {
      console.error("Failed to load cart data:", error);
    }
  };

  useEffect(() => {
    if (isLogged) {
      loadCartData();
    }
  }, [isLogged]);

  // Check if an item variation is in the cart
  const isInCart = (variationId) => {
    return (
      Array.isArray(cart.items) &&
      cart.items.some((item) => item.variations.id === variationId)
    );
  };

  // Add an item to the cart
  const addItemToCart = async (productId, quantity) => {
    if (!isLogged) return;
    await addToCart(productId, quantity);
    await loadCartData();
    // Put the newly added variation at the front of the order
    setItemOrder((prevOrder) => [
      productId,
      ...prevOrder.filter((id) => id !== productId),
    ]);
  };

  // Update item quantity
  const updateItemQuantity = async (itemId, quantity) => {
    if (!isLogged) return;
    await updateCartItem(itemId, quantity);
    const freshCart = await fetchCart();
    setCart({
      ...freshCart,
      total_items: Array.isArray(freshCart.items) ? freshCart.items.length : 0,
    });
    // Keep order unchanged
    return freshCart;
  };

  // Remove an item from the cart
  const removeItemFromCart = async (itemId) => {
    if (!isLogged) return;
    await removeCartItem(itemId);
    const data = await fetchCart();
    setCart({
      ...data,
      total_items: Array.isArray(data.items) ? data.items.length : 0,
    });
    // Remove from order
    setItemOrder((prevOrder) => prevOrder.filter((id) => id !== itemId));
  };

  const reorderItems = async (orderedItems) => {
  if (!isLogged) return;

  try {
    await bulkAddToCart(
      orderedItems.items.map((item) => ({
        variations_id: item.variant.id,
        quantity: item.quantity,
      }))
    );
    // Refresh cart once
    await loadCartData();
  } catch (error) {
    console.error("Failed to reorder items:", error);
  }
};


  return (
    <CartContext.Provider
      value={{
        cart,
        isInCart,
        itemOrder,
        setItemOrder,
        setCart,
        loadCartData,
        addItemToCart,
        updateItemQuantity,
        removeItemFromCart,
        reorderItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
