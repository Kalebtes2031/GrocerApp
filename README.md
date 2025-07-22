# 🛒 Grocer – Customer Shopping App

Kabth is a mobile shopping app built with **React Native** and **Expo**, allowing customers to browse and purchase products from **A Supermarket**. It features real-time order tracking with map integration and a smooth shopping experience from cart to checkout.

---

## 📱 Features

- 🛍️ Browse products by category
- 🧺 Add items to cart and place orders
- 📦 View order history and status
- 🗺️ Real-time delivery tracking with interactive maps
- 🔐 User authentication (register/login)
- 📲 Push notifications for order updates

---

## ⚙️ Tech Stack

- **React Native** with **Expo**
- **Expo Router** for file-based navigation
- **Axios** for API requests
- **MapLibre GL** for map tracking
- **Firebase Realtime Database** for live delivery updates
- **AsyncStorage** for token management
- **Backend**: Django + Django REST Framework

---

## 🚀 Getting Started

### 1. **Clone the Repository**
```bash
git clone https://github.com/kalebtes2031/GrocerApp.git
cd GrocerApp
```

### 2. Install dependencies

   ```bash
   npm install
   ```

### 3. Start the Expo app

   ```bash
   npx expo start
   ```


🔒 Authentication

- Token-based login and registration
- Tokens stored in AsyncStorage
- Auth state managed locally via context/hooks


📍 Order Tracking

- Orders updated in real-time via Firebase Realtime Database
- Delivery agents’ locations are tracked and synced to customers
- Interactive map powered by MapLibre GL



🤝 Related Projects

[Grocer Delivery App](https://github.com/Kalebtes2031/GrocerDeliveryApp)

[Grocer Admin Panel](https://github.com/Kalebtes2031/GrocerAdminDashboard)

[Kabth API](https://github.com/Kalebtes2031/yason/tree/main/EcommerceBackend/ecommerce_backend)


