# ATI Sewing & Fabric Management System (ASFMS) — Implementation Plan

## Context

The client (ATI Sewing & Fabric, Khadija Plaza, Yahaya Gusau) needs a full management system to digitize their tailoring business: customers, measurements, orders, invoicing, payments, fabric inventory, staff, and reporting. The deliverable here is the React frontend with mock/localStorage data layer (frontend-only, no Supabase). The design should feel like a professional desktop-style admin tool suitable for multi-user business use.

---

## Stack & Constraints

- **Framework:** React + TypeScript, Vite
- **Routing:** React Router v7 (already installed)
- **Styling:** Tailwind CSS v4 + `src/styles/theme.css` tokens
- **Icons:** `lucide-react`
- **Charts:** `recharts`
- **UI Primitives:** `@radix-ui/*` (Dialog, Dropdown, Select, Tabs, Table, etc.)
- **Forms:** `react-hook-form` v7.55.0
- **Notifications:** `sonner`
- **Data persistence:** `localStorage` (simulates database; easily replaced with API calls)
- **No @make-kits** — build custom components using Radix primitives + Tailwind tokens

---

## Architecture

```
src/app/
  App.tsx                  — Router root, auth gate
  context/
    AuthContext.tsx         — Current user, role, login/logout
    DataContext.tsx         — Global state: customers, orders, inventory, staff
  lib/
    storage.ts              — localStorage CRUD helpers
    mockData.ts             — Initial seed data
    utils.ts                — ID generators, formatters, date helpers
    permissions.ts          — Role → allowed routes/actions map
  pages/
    LoginPage.tsx
    DashboardPage.tsx
    CustomersPage.tsx
    CustomerDetailPage.tsx
    MeasurementsPage.tsx
    OrdersPage.tsx
    OrderDetailPage.tsx
    PaymentsPage.tsx
    InventoryPage.tsx
    StaffPage.tsx
    ReportsPage.tsx
    SettingsPage.tsx
  components/
    layout/
      AppShell.tsx          — Sidebar + topbar wrapper
      Sidebar.tsx
      Topbar.tsx
    ui/
      DataTable.tsx         — Reusable sortable/filterable table
      StatCard.tsx          — Dashboard KPI card
      Badge.tsx             — Order status badge
      PrintWrapper.tsx      — Print-friendly layout wrapper
      Modal.tsx             — Radix Dialog wrapper
      SearchInput.tsx
    charts/
      RevenueChart.tsx      — Recharts line/bar monthly revenue
      OrderStatusChart.tsx  — Recharts pie chart
      InventoryChart.tsx    — Recharts bar chart
    forms/
      CustomerForm.tsx
      MeasurementForm.tsx
      OrderForm.tsx
      PaymentForm.tsx
      InventoryForm.tsx
      StaffForm.tsx
    print/
      InvoicePrint.tsx
      ReceiptPrint.tsx
      MeasurementCardPrint.tsx
      CustomerCardPrint.tsx
```

---

## Data Models (TypeScript interfaces, stored in localStorage)

```ts
Customer { id, name, phone, address, gender, dob, email, registrationDate, photo?, remarks }
Measurement { id, customerId, garmentType, date, fields: Record<string,string> }
Order { id, orderNumber, customerId, garmentType, fabricType, quantity, amount, advancePayment, balance, collectionDate, tailorId, priority, status, createdAt }
Payment { id, invoiceNumber, customerId, orderId, amountDue, amountPaid, balance, method, date }
InventoryItem { id, itemCode, name, category, color, quantity, unitPrice, supplierId, lowStockThreshold }
StockMovement { id, itemId, type: 'in'|'out'|'adjustment', quantity, date, note }
Staff { id, staffId, name, phone, position, username, passwordHash, role, active }
ActivityLog { id, staffId, action, target, timestamp }
```

---

## Pages & Features

### Login
- Username + password form
- Role-based redirect after login
- Demo accounts for all 5 roles seeded in mock data

### Dashboard (all roles, filtered by role)
- KPI stat cards: Total Customers, Total Orders, Due Today, Ready Orders, Total Sales, Outstanding Balance, Low Stock items
- Monthly Revenue bar chart (Recharts)
- Order Status pie chart
- Inventory summary bar chart
- Recent orders table

### Customers (Admin, Reception)
- Searchable/filterable table
- Add/Edit/View customer modal (react-hook-form)
- Auto-generated Customer ID (ATI-XXXX)
- Customer detail page: info + measurements + order history + payment history
- Print customer card (CSS @media print)

### Measurements (Admin, Reception, Tailor)
- Per-customer measurement records
- Garment type selector (Native Wear, Trouser, Agbada, Suit) → dynamic fields
- History list with comparison view
- Print measurement card

### Orders (Admin, Reception, Tailor)
- Order list with status badges (color-coded)
- Add order form with customer picker, tailor assignment, priority selector
- Status update workflow (Tailor can advance status)
- Due date alerts (highlight overdue)
- Order detail with payment summary

### Payments (Admin, Reception, Manager)
- Invoice list
- Add payment modal (select order → pre-fill amounts)
- Payment method: Cash / Transfer / POS
- Receipt print
- Outstanding balances view
- Daily revenue summary

### Inventory (Admin, Inventory Officer)
- Fabric items table with low-stock highlighting
- Add/Edit item form
- Stock In / Stock Out / Adjustment movement modal
- Movement history per item
- Inventory valuation summary

### Staff (Admin only)
- Staff list
- Add/Edit staff with role selector
- Activity log viewer
- Login history

### Reports (Admin, Manager)
- Date-range filter (daily/weekly/monthly/annual presets)
- Sales report table + chart
- Order report
- Customer report
- Inventory report
- Print any report

### Settings (Admin only)
- Business info display (ATI header)
- Backup: export all localStorage data as JSON download
- Restore: import JSON file

---

## Role-Based Access

```
Admin:         All pages
Reception:     Dashboard, Customers, Measurements, Orders, Payments
Tailor:        Dashboard (limited), Orders (status update only), Measurements
Inventory:     Dashboard, Inventory
Manager:       Dashboard, Reports, Payments (view + approve discounts)
```

Unauthorized route access → redirect to Dashboard with toast warning.

---

## Print Support

Each printable document uses `window.print()` with a hidden `@media print` section showing ATI company header:
> ATI Sewing & Fabric | Khadija Plaza, Yahaya Gusau | 09011330016 | Atisewing02@gmail.com

---

## Implementation Order

1. `lib/` — storage helpers, mock seed data, permissions, utils
2. `context/` — AuthContext + DataContext providers
3. `App.tsx` — Router setup with protected routes
4. `components/layout/` — AppShell, Sidebar, Topbar
5. `LoginPage.tsx`
6. `DashboardPage.tsx` + chart components + StatCard
7. `CustomersPage.tsx` + `CustomerDetailPage.tsx` + CustomerForm
8. `MeasurementsPage.tsx` + MeasurementForm
9. `OrdersPage.tsx` + `OrderDetailPage.tsx` + OrderForm
10. `PaymentsPage.tsx` + PaymentForm + InvoicePrint + ReceiptPrint
11. `InventoryPage.tsx` + InventoryForm
12. `StaffPage.tsx` + StaffForm
13. `ReportsPage.tsx`
14. `SettingsPage.tsx` (backup/restore)
15. Print components for all printable documents

---

## Verification

- Login with each of the 5 demo role accounts and confirm route access is correctly restricted
- Create a customer, add measurements, create an order, make a payment — verify the flow end-to-end
- Advance an order through all 7 statuses as Tailor role
- Perform stock-in and stock-out on an inventory item; verify quantity updates and low-stock alert
- Navigate to Reports and verify charts render with real data
- Trigger print on Invoice, Receipt, Measurement Card — confirm ATI header appears
- Export backup JSON and re-import to verify restore works
