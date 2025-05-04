import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { fetchSearchProducts } from "@/hooks/useFetch";

const SearchProducts = () => {
  const navigation = useRouter();
  const { t, i18n } = useTranslation("header");
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      // If no query, clear results and close dropdown
      if (!debouncedQuery.trim()) {
        setProducts([]);
        setShowDropdown(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetchSearchProducts(debouncedQuery);
        setProducts(response.data);
        // Only show dropdown if there is any input
        setShowDropdown(true);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [debouncedQuery]);

  const highlightText = (text, highlight) => {
    if (!text) return text;

    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return parts.map((part, index) => (
      <Text
        key={index}
        style={
          part.toLowerCase() === highlight.toLowerCase() ? styles.highlight : {}
        }
      >
        {part}
      </Text>
    ));
  };

  // Handler for taps outside of the search area
  const handleOutsidePress = () => {
    Keyboard.dismiss();
    setShowDropdown(false);
  };

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.input}
              placeholder={t("search")}
              value={query}
              onChangeText={(text) => {
                setQuery(text);
                // Only show dropdown if there is some input
                if (text.trim()) {
                  setShowDropdown(true);
                } else {
                  setShowDropdown(false);
                }
              }}
              placeholderTextColor="#445399"
              onFocus={() => {
                // Only open dropdown if there's input already
                if (query.trim()) setShowDropdown(true);
              }}
            />

            <TouchableOpacity
              onPress={() => query && setQuery("")}
              style={styles.clearButton}
            >
              {query ? (
                <FontAwesome name="times" size={18} color="#445399" />
              ) : null}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => Keyboard.dismiss()}
            >
              <Feather name="search" size={20} color="#445399" />
            </TouchableOpacity>
          </View>

          {showDropdown && (
            <View style={styles.dropdown}>
              {loading ? (
                <Text style={styles.loadingText}>Loading...</Text>
              ) : products.length > 0 ? (
                <FlatList
                  data={products}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.item}
                      onPress={() => {
                        const wrappedProduct = {
                          item_name: item.item_name,
                          item_name_amh: item.item_name_amh,
                          category: {
                            name: item.category,
                            name_amh: item.category,
                          }, // adapt as needed
                          image: item.image,
                          variation: {
                            id: item.id,
                            quantity: item.quantity,
                            unit: item.unit,
                            price: item.price,
                            in_stock: item.in_stock,
                            stock_quantity: item.stock_quantity,
                          },
                        };

                        navigation.push(
                          `/carddetail?product=${encodeURIComponent(
                            JSON.stringify(wrappedProduct)
                          )}`
                        );
                        setQuery(
                          i18n.language === "en"
                            ? item.item_name
                            : item.item_name_amh
                        );
                        setShowDropdown(false);
                      }}
                    >
                      <View style={{flexDirection:"row" }}>
                        <Text style={styles.itemText}>
                          {i18n.language === "en"
                            ? highlightText(item.item_name, query)
                            : highlightText(item.item_name_amh, query)}
                        </Text>
                        <Text>
                          {parseInt(item.quantity)} {item.unit}
                        </Text>
                      </View>
                      <Text style={styles.price}>${item.price}</Text>
                    </TouchableOpacity>
                  )}
                />
              ) : (
                <Text style={styles.noResults}>No results found</Text>
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 14,
    marginVertical: 6,
    zIndex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 50,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#445399",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    padding: 8,
    marginRight: 8,
  },
  searchButton: {
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: "#445399",
  },
  dropdown: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 4,
    maxHeight: 200,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
    marginBottom: 23,
  },
  itemText: {
    fontSize: 14,
    color: "#333",
    marginRight:6,
    // flex: 1,
  },
  price: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  highlight: {
    fontWeight: "bold",
    color: "#445399",
  },
  loadingText: {
    padding: 16,
    textAlign: "center",
    color: "#666",
  },
  noResults: {
    padding: 16,
    textAlign: "center",
    color: "#666",
  },
});

export default SearchProducts;
