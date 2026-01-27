# EL/Amen Food Court - Restaurant Management System

## Overview
EL/Amen is a mobile restaurant management system built with React Native (Expo) and Express.js. It features two separate app flows:

1. **Worker App** - For kitchen staff to view menu, create orders, and manage order status
2. **Manager App** - For administrators to manage products, workers, view analytics, and download reports

## Current State
- **Version**: 1.1.0 (Online MVP)
- **Status**: Fully online app with PostgreSQL database and REST API
- **Authentication**: Role-based (worker/manager) with AsyncStorage
- **Currency**: Ethiopian Birr (Br)
- **Theme**: Dark/Light mode with toggle and persistence

## Tech Stack
- **Frontend**: React Native with Expo, TypeScript
- **Backend**: Express.js with REST API
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: React Context API
- **Data Persistence**: PostgreSQL (online), AsyncStorage (auth/theme preferences)
- **Real-time Sync**: 5-second polling interval
- **UI**: Custom components with red (#D4241B) and yellow (#F5C518) color scheme

## Project Architecture

### Frontend Structure
```
client/
├── App.tsx                    # Root component with providers
├── context/
│   ├── AuthContext.tsx        # Authentication state
│   └── DataContext.tsx        # Products/orders/workers data management
├── components/
│   ├── ProductCard.tsx        # Product display card
│   ├── OrderCard.tsx          # Order display card
│   ├── StatusBadge.tsx        # Order status indicator (Order/Completed)
│   ├── HeaderTitle.tsx        # App header with logo
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
│       ├── ManagerProfileScreen.tsx
│       ├── WorkerManagementScreen.tsx
│       └── ReportsScreen.tsx
├── types/
│   └── index.ts               # TypeScript types
└── constants/
    └── theme.ts               # Colors, spacing, typography, CURRENCY
```

## Key Features

### Worker App
- Browse available menu products
- Create orders by adding products to cart
- View and manage orders with simplified status: "Order" (pending) → "Completed"
- **Edit/Delete Orders**: Workers can edit order details or delete orders
- **Date Filter**: Filter completed orders by Today, This Week, This Month, or All Time
- **Full Date/Time Display**: Orders show both date and time (e.g., "Today, 10:30 AM" or "Jan 15, 2:45 PM")
- Sign out from Profile tab

### Manager App
- Dashboard with real-time stats (revenue, active orders, available items)
- View all orders with filtering by status
- Manage products (add, edit, toggle availability)
- **Manage Workers**: Add new kitchen staff, delete workers
- **Download Reports**: Daily and monthly CSV reports with order details
- Sign out from Profile tab

## Color Scheme
- **Primary**: #D4241B (Red) - EL/Amen brand color
- **Secondary**: #F5C518 (Yellow) - Accent color
- **Status Colors**:
  - Pending/Order: #F5C518
  - Completed: #06D6A0

## Running the App
1. **Start Backend**: `npm run server:dev` (port 5000)
2. **Start Frontend**: `npm run expo:dev` (port 8081)
3. Scan QR code with Expo Go or open web version

## User Flow
1. Open app → Login screen with EL/Amen branding
2. Enter username and select role (Worker or Manager)
3. Navigate to respective app features
4. Sign out from Profile tab

## Recent Changes
- Added delete/edit functionality for orders in worker app with confirmation modal
- Added date filter for completed orders (Today, This Week, This Month, All Time)
- Updated OrderCard to show full date and time for all orders
- Modernized bottom navigation with rounded corners, blur effects, and highlighted active icons
- Renamed app from Kitchen Flow to EL/Amen
- Added EL/Amen logo integration
- Changed currency from USD ($) to Ethiopian Birr (Br)
- Simplified worker order status to "Order" and "Completed" only
- Added Manager Profile tab with logout
- Added Worker Management screen for managers
- Added Reports screen with CSV download (daily/monthly)
- Integrated PostgreSQL database with Drizzle ORM for products, orders, and workers
- Created comprehensive REST API with endpoints for all CRUD operations and authentication
- Updated DataContext to fetch from API with real-time polling (5-second intervals)
- Implemented dark/light mode theme toggle with AsyncStorage persistence
- Added real-time push notifications for managers when new orders are placed (works best on Expo Go)

## User Preferences
- Currency: Ethiopian Birr (Br)
- Simplified order workflow for workers
- Red and yellow color scheme matching EL/Amen branding

## Future Enhancements
- Cloudinary integration for product images
- Real-time updates with Socket.IO
- Push notifications for order updates
