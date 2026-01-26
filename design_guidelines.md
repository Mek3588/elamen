# Restaurant Management System - Design Guidelines

## Brand Identity

**Purpose**: Kitchen-to-management workflow system for fast-paced restaurant environments. Worker app prioritizes SPEED and CLARITY in chaotic kitchen settings. Manager app balances control with at-a-glance insights.

**Aesthetic Direction**: Bold/Utilitarian - High contrast, status-driven, zero-friction. Think industrial kitchen equipment: functional, durable, instantly readable. Not pretty for pretty's sake - EFFECTIVE under pressure.

**Memorable Element**: Color-coded order status system that's visible across the room. Status colors are the brand - they mean something in the real world (preparing = orange heat, ready = green go).

---

## Navigation Architecture

### Worker App
**Root Navigation**: Tab Navigation (3 tabs)
- **Products** (left): Browse menu, create orders
- **Orders** (center): Active orders, accept incoming
- **Profile** (right): Settings, logout

All worker screens use transparent headers to maximize content space.

### Manager App  
**Root Navigation**: Tab Navigation (4 tabs + FAB)
- **Dashboard** (left): Live kitchen view, real-time stats
- **Orders** (center-left): All orders, history, filtering
- **Products** (center-right): Menu management, add/edit items
- **Analytics** (right): Revenue, performance metrics
- **Floating Action Button**: Quick add product/order

Manager screens use solid headers with actions for control-heavy interfaces.

---

## Screen Specifications

### WORKER APP

**Products Screen**
- Header: Transparent, search bar, filter icon (right)
- Layout: Grid (2 columns), product cards showing image, name, price, availability badge
- Empty state: "No products available" with chef hat illustration
- Safe area: Top = headerHeight + 24, Bottom = tabBarHeight + 24

**Orders Screen** (Kitchen View)
- Header: Transparent, "New Orders" badge (right)
- Layout: Scrollable, segmented control (Incoming / Active / Completed), order cards grouped by status
- Order card: Order #, timestamp, items list, status indicator, accept/update button
- Empty state: "All caught up!" with checkmark illustration
- Safe area: Top = headerHeight + 24, Bottom = tabBarHeight + 24

**Order Detail** (Modal)
- Header: Solid white, back button (left), order #
- Layout: Scrollable, items list, notes field, status picker, save button (bottom)
- Safe area: Top = 16, Bottom = insets.bottom + 16

### MANAGER APP

**Dashboard Screen**
- Header: Transparent, notification bell with badge (right)
- Layout: Scrollable, stat cards (revenue, active orders, workers online), live order feed
- Safe area: Top = headerHeight + 24, Bottom = tabBarHeight + 24

**Orders Screen**
- Header: Solid, filter icon (left), search (center), calendar (right)
- Layout: List, filterable by status/worker/date, order rows with status color bar
- Safe area: Top = 16, Bottom = tabBarHeight + 24

**Products Screen**
- Header: Solid, "Add Product" (right)
- Layout: List, product rows with thumbnail, name, price, toggle switch (available/unavailable)
- Empty state: "Create your first product" with menu illustration
- Safe area: Top = 16, Bottom = tabBarHeight + 24

**Add/Edit Product** (Modal)
- Header: Solid, cancel (left), "Save" (right, primary color)
- Layout: Scrollable form, image picker, text inputs (name, price, category), availability toggle, delete button (destructive)
- Safe area: Top = 16, Bottom = insets.bottom + 16

**Analytics Screen**
- Header: Solid, date range selector
- Layout: Scrollable, bar chart (revenue), top products list, worker performance cards
- Safe area: Top = 16, Bottom = tabBarHeight + 24

---

## Color Palette

**Primary**: `#E85D04` (Flame Orange) - action buttons, active states, "preparing" status
**Secondary**: `#0A9396` (Teal) - manager-specific actions, analytics highlights
**Background**: `#FAFAFA` (Off-White) - main bg, reduces eye strain
**Surface**: `#FFFFFF` - cards, modals
**Text Primary**: `#1A1A1A` - headings, labels
**Text Secondary**: `#6B6B6B` - descriptions, metadata

**Status Colors** (semantic, universally recognizable):
- Pending: `#F4A261` (Warm Sand)
- Accepted: `#2A9D8F` (Ocean Green)
- Preparing: `#E76F51` (Hot Coral)
- Ready: `#06D6A0` (Bright Mint)
- Served/Complete: `#B8B8B8` (Cool Gray)

**Semantic**:
- Error: `#D62828`
- Warning: `#F77F00`
- Success: `#06D6A0`

---

## Typography

**Primary Font**: **Inter** (Google Font) - exceptional legibility at small sizes, modern, works at all weights
**Display**: Inter Bold, 28-32pt (screen titles)
**Heading**: Inter SemiBold, 18-20pt (section headers, card titles)
**Body**: Inter Regular, 15-16pt (lists, descriptions)
**Caption**: Inter Medium, 12-13pt (timestamps, metadata)
**Button**: Inter SemiBold, 16pt

---

## Assets to Generate

**App Icons**:
- `worker-icon.png` - Chef hat silhouette on flame orange bg (Worker App home screen)
- `manager-icon.png` - Dashboard grid on teal bg (Manager App home screen)

**Splash**:
- `worker-splash-icon.png` - Simplified chef hat (Worker launch screen)
- `manager-splash-icon.png` - Dashboard icon (Manager launch screen)

**Empty States**:
- `empty-products.png` - Simple menu/plate outline, warm gray (Worker Products screen when no items)
- `empty-orders.png` - Checkmark with "all done" feel, teal (Worker Orders when no active orders)
- `empty-menu-admin.png` - Fork/knife crossed, orange accent (Manager Products screen)
- `empty-analytics.png` - Minimal bar chart outline, gray (Manager Analytics with no data)

**Illustrations**:
- `notification-icon.png` - Bell with badge, used in manager notification list
- `worker-avatar-placeholder.png` - Generic profile silhouette (user profiles)

**Visual Design**: Use Feather icons for all UI actions (search, filter, bell, settings, etc.). Order status uses COLOR not icons for instant recognition. Floating action button (manager app) has shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2.