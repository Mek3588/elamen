# Kitchen Flow - Restaurant Management System

## Overview
Kitchen Flow is a mobile restaurant management system built with React Native (Expo) and Express.js. It features two separate app flows:

1. **Worker App** - For kitchen staff to view menu, create orders, and manage order status
2. **Manager App** - For administrators to manage products, view all orders, and access analytics

## Current State
- **Version**: 1.0.0 (MVP)
- **Status**: Functional MVP with local data persistence
- **Authentication**: Role-based (worker/manager) with AsyncStorage

## Tech Stack
- **Frontend**: React Native with Expo, TypeScript
- **Backend**: Express.js (for future API expansion)
- **State Management**: React Context API
- **Data Persistence**: AsyncStorage (local)
- **UI**: Custom components following design_guidelines.md

## Project Architecture

### Frontend Structure
```
client/
├── App.tsx                    # Root component with providers
├── context/
│   ├── AuthContext.tsx        # Authentication state
│   └── DataContext.tsx        # Products/orders data management
├── components/
│   ├── ProductCard.tsx        # Product display card
│   ├── OrderCard.tsx          # Order display card
│   ├── StatusBadge.tsx        # Order status indicator
│   ├── EmptyState.tsx         # Empty list illustration
│   └── LoadingSpinner.tsx     # Loading indicator
├── navigation/
│   ├── RootStackNavigator.tsx # Auth-based navigation
│   ├── WorkerStackNavigator.tsx
│   ├── WorkerTabNavigator.tsx
│   ├── ManagerStackNavigator.tsx
│   └── ManagerTabNavigator.tsx
├── screens/
│   ├── LoginScreen.tsx        # Role selection & login
│   ├── OrderDetailScreen.tsx  # Order management
│   ├── ProductFormScreen.tsx  # Add/edit products
│   ├── worker/
│   │   ├── WorkerProductsScreen.tsx
│   │   ├── WorkerOrdersScreen.tsx
│   │   └── WorkerProfileScreen.tsx
│   └── manager/
│       ├── ManagerDashboardScreen.tsx
│       ├── ManagerOrdersScreen.tsx
│       ├── ManagerProductsScreen.tsx
│       └── ManagerAnalyticsScreen.tsx
├── types/
│   └── index.ts               # TypeScript types
└── constants/
    └── theme.ts               # Colors, spacing, typography
```

### Backend Structure
```
server/
├── index.ts                   # Express server setup
├── routes.ts                  # API routes (expandable)
└── storage.ts                 # Memory storage (expandable)
```

## Key Features

### Worker App
- Browse available menu products
- Create orders by adding products to cart
- View and manage assigned orders
- Update order status (Pending → Accepted → Preparing → Ready → Served)
- Add notes to orders

### Manager App
- Dashboard with real-time stats (revenue, active orders, available items)
- View all orders with filtering by status
- Manage products (add, edit, toggle availability)
- Analytics with revenue charts and top products

## Color Scheme
- **Primary**: #E85D04 (Flame Orange) - Worker actions, preparing status
- **Secondary**: #0A9396 (Teal) - Manager actions, analytics
- **Status Colors**:
  - Pending: #F4A261
  - Accepted: #2A9D8F
  - Preparing: #E76F51
  - Ready: #06D6A0
  - Served: #B8B8B8

## Running the App
1. **Start Backend**: `npm run server:dev` (port 5000)
2. **Start Frontend**: `npm run expo:dev` (port 8081)
3. Scan QR code with Expo Go or open web version

## User Flow
1. Open app → Login screen
2. Enter username and select role (Worker or Manager)
3. Navigate to respective app features
4. Sign out from Profile tab

## Recent Changes
- Initial MVP build with complete frontend
- Role-based authentication
- Product and order management
- AsyncStorage for data persistence
- Sample product data included

## Future Enhancements
- Backend API integration with database
- Real-time updates with Socket.IO
- Push notifications for order updates
- Image upload for products
- Worker performance tracking
- Multi-device sync
