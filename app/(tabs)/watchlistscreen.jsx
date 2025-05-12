import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useWatchlist } from "@/context/WatchlistProvider";
import Card from "@/components/Card";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

const WatchlistScreen = () => {
  const { watchlist } = useWatchlist();
  const router = useRouter();
  const { t, i18n } = useTranslation("watchlist");

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginHorizontal: 10, paddingHorizontal: 2 }}
          className="border w-10 h-10 flex flex-row justify-center items-center py-1 rounded-full border-gray-300"
        >
          <Ionicons name="arrow-back" size={24} color="#445399" />
        </TouchableOpacity>
        <View style={styles.iconWrapper}>
          <TouchableOpacity>
            <MaterialIcons name="favorite-border" size={28} color="#445399" />
          </TouchableOpacity>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{watchlist.length}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.title}>{t('my')}</Text>
      {watchlist.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
 <View style={styles.iconWrapper}>
          <TouchableOpacity>
            <MaterialIcons name="favorite-border" size={200} color="#BE3144" />
          </TouchableOpacity>
          <View style={styles.badge1}>
            <Text style={styles.badgeText1}>{watchlist.length}</Text>
          </View>
        </View>
          <Text style={styles.emptyMessage}>{t('your')}</Text>
          </View>
      ) : (
        // Render using a FlatList or map method
        <View style={styles.popularContainer}>
          {watchlist.length > 0 ? (
            watchlist.map((product, index) => (
              <View key={product.variation.id || index} style={styles.cardWrapper}>
                <Card product={product} />
              </View>
            ))
          ) : (
            <Text style={styles.loadingText}>{t('loading')}</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerContainer: {
    height: 60,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  iconWrapper: {
    position: "relative",
    marginRight: 16,
  },
  badge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#445399",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  badge1: {
    position: "absolute",
    top: 1,
    right: 6,
    backgroundColor: "#BE3144",
    borderRadius: 50,
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    // borderWidth: 1,
  },
  badgeText1: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#445399",
    marginBottom: 30,
  },
  popularContainer: {
    marginBottom: 36,
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardWrapper: {
    width: "48%",
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
  },
  emptyMessage: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop:43
  },
});

export default WatchlistScreen;
