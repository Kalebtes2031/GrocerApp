import axios from "axios";
import Constants from "expo-constants";
import { useNavigation } from "@react-navigation/native";
// hooks/useFetch.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

// const baseUrl = "https://malhibnewbackend.activetechet.com/";
// const baseUrl = "http://192.168.227.193:8000/";  //active wifi authentication error or server error
// const baseUrl = "http://192.168.100.51:8000/";  //active wifi authentication error or server error
// const baseUrl = "http://192.168.1.5:8000/"; //home wifi
// const baseUrl = "http://192.168.65.193:8000/";  //my data network
// const baseUrl = "http://192.168.8.17:8000/";  //my data network
// npm i @react-native-picker/picker@2.9.0 expo@52.0.42 expo-constants@17.0.8 expo-location@18.0.10 expo-router@4.0.20 expo-system-ui@4.0.9 react-native@0.76.9 react-native-svg@15.8.0 jest-expo@52.0.6
const rawUrl = Constants.expoConfig?.extra?.apiUrl;
if (!rawUrl) {
    throw new Error(
      "No API URL defined—did you forget to set EXPO_PUBLIC_API_URL in your eas.json preview profile?"
    );
  }
  // ensure it ends with a slash
  const baseUrl = rawUrl.endsWith("/") ? rawUrl : `${rawUrl}/`;
  

const auth = axios.create({
  baseURL: baseUrl,
});

const api = axios.create({
  baseURL: `${baseUrl}api/`,
});

const pay = axios.create({
  baseURL: `${baseUrl}pay/`,
});

// const account = axios.create({
//     baseURL: `${baseUrl}account/`,
// });

export const ActivateUser = async (c) => {
  console.log(c);
  const res = await auth.post("auth/users/activation/", c);

  return res.data;
};
// export const GET_AUTH = async (credentials) => {
//     const response = await auth.post("auth/jwt/create/", credentials);
//     return response.data;
// };
// export const GET_AUTH = async (form) => {
//   try {
//     const response = await auth.post("auth/jwt/create/", form);
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.detail || "An error occurred");
//   }
// };
// useFetch.jsx
export const GET_AUTH = async (payload) => {
  try {
    // now payload must have { login, password }
    const response = await auth.post("auth/jwt/create/", payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "An error occurred");
  }
};


export const setTokens = (accessToken, refreshToken) => {
  sessionStorage.setItem("accessToken", accessToken);
  sessionStorage.setItem("refreshToken", refreshToken);
};

//it's work is just to remove tokens from the local storage
// export const removeTokens = () => {
//     sessionStorage.removeItem("accessToken");
//     sessionStorage.removeItem("refreshToken");
// };
// Remove tokens
export const getAccessToken = async () => {
  try {
    return await AsyncStorage.getItem("accessToken");
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

export const removeTokens = async () => {
  try {
    await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
  } catch (error) {
    console.error("Error removing tokens:", error);
  }
};

export const CREATE_NEW_USER = async (credentials) => {
  console.log("am i a problem:", credentials);
  const response = await auth.post("auth/users/", credentials);
  return response.data;
};
export const CREATE_NEW_CUSTOMER = async (credentials) => {
  console.log("am i a problem:", credentials);
  const response = await auth.post("account/register/", credentials);
  return response.data;
};
export const USER_PROFILE = async () => {
  const response = await auth.get("account/profile/");
  return response.data;
};
export const RESET_PASSWORD = async (data) => {
  const response = await auth.post("auth/users/reset_password_confirm/", data);
  return response.data;
};

export const RESET_USER_PASSWORD = async (email) => {
  const response = await auth.post(`auth/users/reset_password/`, email);
  return response.data;
};
export const redirectToLogin = () => {
  const navigation = useRouter();
  navigation.push("/(auth)/sign-in");
};

// Fetch all images from the gallery
export const fetchImages = async () => {
  const response = await api.get("images/");
  return response.data;
};

// Upload a new image to the gallery
export const uploadImage = async (formData) => {
  const response = await api.post("images/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Delete an image by its ID
export const deleteImage = async (id) => {
  const response = await api.delete(`images/${id}/`);
  return response.data;
};

export const fetchProducts = async () => {
  const response = await api.get("customer/products/");
  return response.data;
};
export const fetchCategory = async () => {
  const response = await api.get("category-list/");
  return response.data;
};

export const fetchProductDetail = async (id) => {
  const res = await api.get(`customer/products/${id}`);
  return res.data;
};

export const fetchRelatedProducts = async (id) => {
  //First fetch clicked product info
  const productResponse = await api.get(`customer/products/${id}`);
  //Fetch related products based on categoryId
  const res = await api.get(
    `customer/products?categoryId=${productResponse.data.category.id}`
  );
  return res.data;
};

export const fetchAnnouncements = async () => {
  const res = await api.get(`announcements/`);
  return res.data;
};
export const fetchSortedProducts = async (sort) => {
  const { data } = await api.get(`customer/products/?sort=${sort}`);
  return data;
};
export const fetchSameCategoryProducts = async (categoryId) => {
  const { data } = await api.get(
    `customer/products/?category_id=${categoryId}`
  );
  return data;
};

export const fetchPopularProducts = async () => {
  const res = await api.get("popular-variations/");
  return res.data;
};

export const fetchNewImages = async () => {
  const res = await api.get("products/?sort=latest");
  return res.data;
};

// get access token
// export const getAccessToken = () => {
//     return sessionStorage.getItem("accessToken");
// };
// Get access token

export const whoami = async () => {
  const accesstoken = sessionStorage.getItem("accessToken");

  if (!accesstoken) {
    redirectToLogin();
    return;
  }
  try {
    // Fetch user information
    const response = await auth.get("auth/users/me/");
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error("User is not authenticated.");
      redirectToLogin();
    } else {
      console.error("Failed to fetch user information:", error);
    }
    throw error; // Rethrow error for higher-level handling
  }
};

export const fetchCart = async () => {
  const response = await api.get("cart/");
  console.log("cart is : ", response.data);
  return response.data;
};

export const fetchCartSummary = async () => {
  const response = await api.get("cart/summary/");
  return response.data;
};

export const addToCart = async (variations_id, quantity) => {
  const response = await api.post("cart/items/", { variations_id, quantity });
  return response.data;
};

export const updateCartItem = async (itemId, quantity) => {
  const response = await api.patch(`cart/items/${itemId}/`, { quantity });
  return response.data;
};

export const scheduleDelivery = async (
  orderId,
  date,
  customer_latitude,
  customer_longitude,
  customer_address
) => {
  const response = await pay.patch(`orders/${orderId}/schedule-delivery/`, {
    scheduled_delivery: date,
    customer_latitude,
    customer_longitude,
    customer_address,
  });
  return response.data;
};
export const scheduleDeliveryAndPickFromStore = async (orderId, date) => {
  const response = await pay.patch(
    `orders/${orderId}/schedule-delivery-pick-from-store/`,
    {
      scheduled_delivery: date,
    }
  );
  return response.data;
};

export const removeCartItem = async (itemId) => {
  const response = await api.delete(`cart/items/${itemId}/`);
  return response.data;
};

export const fetchHomePageImages = async () => {
  const response = await api.get("traditional-dressing/");
  return response.data;
};
export const fetchExploreFamilyImage = async () => {
  const response = await api.get("explore-family/");
  return response.data;
};

export const fetchEventImage = async () => {
  const response = await api.get("event/");
  return response.data;
};

export const fetchDiscoverEthiopianImage = async () => {
  const response = await api.get("discover-ethiopian/");
  return response.data;
};

export const fetchBanks = async () => {
  const response = await api.get("banks/");
  return response.data;
};
export const createOrder = async (orderinfo) => {
  const response = await pay.post("orders/create/", orderinfo);
  return response.data;
};

export const fetchOrderHistory = async () => {
  const response = await pay.get("orders/");
  return response.data;
};
export const fetchDeliveryNeedOrderHistory = async () => {
  const response = await pay.get("orders/need-delivery/");
  return response.data;
};

export const fetchOrderDetail = async (id) => {
  const response = await pay.get(`orders/${id}/`);
  return response.data;
};
export const confirmOrder = async (id) => {
  const response = await pay.post(`orders/${id}/confirm-delivery/`);
  return response.data;
};

export const fetchSearchProducts = async (query) => {
  const response = await api.get(`search/?q=${query}`);
  return response;
};

export const fetchPaymentHistoryBasedOrderId = async (id) => {
  const response = await pay.get(`payment-history/${id}/`);
  return response.data;
};

export const payUsingBankTransfer = async (paymentData) => {
  const response = await pay.post("update-payment-status/", paymentData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response;
};
export const updateUserProfile = async (formDataToSend) => {
  const response = await auth.put(
    "account/user/profile/update/",
    formDataToSend,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response;
};
export const updateUserProfileImage = async (formData) => {
  const response = await auth.put("account/user/profile/update/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response;
};

export const validateToken = async () => {
  const accessToken = getAccessToken();
  const refreshToken = sessionStorage.getItem("refreshToken");

  if (!accessToken && refreshToken) {
    try {
      const refreshResponse = await auth.post("auth/jwt/refresh/", {
        refresh: refreshToken,
      });
      setTokens(refreshResponse.data.access, refreshToken);
      return refreshResponse.data.access;
    } catch (error) {
      console.error("Token refresh failed:", error);
      removeTokens();
      redirectToLogin();
    }
  }

  if (!accessToken && !refreshToken) {
    removeTokens();
    redirectToLogin();
  }

  return accessToken;
};

// intercept request and modify headers
auth.interceptors.request.use(
  async (config) => {
    if (
      config.url.includes("auth/jwt/create/") ||
      config.url.includes("auth/users/") ||
      config.url.includes("account/register/")
    ) {
      return config; // Don't attach Authorization header for login, registration, etc.
    }
    const accessToken = await getAccessToken();
    if (!accessToken) {
      redirectToLogin();
      return;
    }
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    console.log("Request Headers:", config.headers); // Debug headers
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// response interceptors
auth.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          originalRequest._retry = true; // Mark request as retried
          const refreshResponse = await auth.post("auth/jwt/refresh/", {
            refresh: refreshToken,
          });
          setTokens(refreshResponse.data.access, refreshToken);
          originalRequest.headers[
            "Authorization"
          ] = `Bearer ${refreshResponse.data.access}`;
          return auth.request(originalRequest);
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          redirectToLogin();
        }
      } else {
        console.warn("No refresh token available; redirecting to login.");
        redirectToLogin();
      }
    }
    return Promise.reject(error);
  }
);

pay.interceptors.request.use(
  async (config) => {
    // Attach the token for authorized routes
    const accessToken = await getAccessToken();
    if (!accessToken) {
      console.log("No access token, redirecting to login");
      redirectToLogin(); // Redirect to login if no token
      throw new Error("No access token available"); // Stop further request processing
    }

    // Add the token to headers for protected routes
    config.headers["Authorization"] = `Bearer ${accessToken}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API instance interceptor (Handles other protected API requests)
api.interceptors.request.use(
  async (config) => {
    // Skip adding token header for non-auth routes (like public content or unauthenticated APIs)
    const publicRoutes = [
      /^customer\/products\/$/, // Matches 'customer/products/'
      /^customer\/products\/\?sort=popularity$/, // Matches 'customer/products?sort=popularity'
      /^customer\/products\/\?sort=latest$/, // Matches 'customer/products?sort=latest'
      /^customer\/products\/\?sort=price_asc$/, // Matches 'customer/products?sort=price_asc'
      /^customer\/products\/\?sort=price_desc$/, // Matches 'customer/products?sort=price_desc'
      /^customer\/products\/\d+$/, // Matches 'customer/products/{id}' where id is a number
      /^customer\/products\?categoryId=\d+$/, // Matches 'customer/products?categoryId={id}'
      /^traditional-dressing\/$/,
      /^explore-family\/$/,
      /^event\/$/,
      /^announcements\/$/,
      /^discover-ethiopian\/$/,
      /^search\/\?q=.*/, // Assuming search is not under 'customer'
    ];

    // Check if the current URL matches any of the public routes
    const isPublicRoute = publicRoutes.some((route) => route.test(config.url));

    if (isPublicRoute) {
      return config; // Skip adding token header for public routes
    }

    // Attach the token for authorized routes
    const accessToken = await getAccessToken();
    if (!accessToken) {
      console.log("No access token, redirecting to login");
      redirectToLogin(); // Redirect to login if no token
      throw new Error("No access token available"); // Stop further request processing
    }

    // Add the token to headers for protected routes
    config.headers["Authorization"] = `Bearer ${accessToken}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API response interceptor (Handles token refresh logic for protected routes)
api.interceptors.response.use(
  (response) => response, // If the request is successful, return the response
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      // Unauthorized (Token expired)
      const refreshToken = sessionStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          // Attempt to refresh the token
          const refreshResponse = await auth.post("auth/jwt/refresh/", {
            refresh: refreshToken,
          });

          // Update sessionStorage with new tokens
          setTokens(refreshResponse.data.access, refreshToken);

          // Retry the original request with the new access token
          originalRequest.headers[
            "Authorization"
          ] = `Bearer ${refreshResponse.data.access}`;
          return api.request(originalRequest);
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          // If refresh fails, redirect to login
          redirectToLogin();
        }
      } else {
        console.warn("No refresh token available; redirecting to login.");
        redirectToLogin();
      }
    }

    return Promise.reject(error); // Return any errors not related to 401
  }
);
