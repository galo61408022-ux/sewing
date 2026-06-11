export type Role = 'admin' | 'reception' | 'tailor' | 'inventory' | 'manager';
export type PaymentMethod = 'Cash' | 'Transfer' | 'POS';
export type StockMovementType = 'inbound' | 'outbound' | 'adjustment';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  registrationDate: string;
}

export interface Order {
  id: string;
  customerId: string;
  status: 'Pending' | 'In Progress' | 'Delivered' | 'Cancelled' | 'Ready' | 'Cutting' | 'Sewing' | 'Finishing';
  items: OrderItem[];
  total: number;
  collectionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  product: string;
  quantity: number;
  price: number;
}

export interface Payment {
  id: string;
  orderId: string;
  amountPaid: number;
  balance: number;
  method: PaymentMethod;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  itemCode: string;
  name: string;
  category: string;
  color?: string;
  quantity: number;
  unitPrice: number;
  supplier?: string;
  lowStockThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  type: StockMovementType;
  quantity: number;
  reason?: string;
  createdAt: string;
}

export interface Staff {
  id: string;
  staffId: string;
  name: string;
  phone: string;
  position: string;
  username: string;
  password: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
}

export type GarmentType = 'Native Wear' | 'Trouser' | 'Agbada' | 'Suit';

export interface Measurement {
  id: string;
  customerId: string;
  garmentType: GarmentType;
  date: string;
  fields: Record<string, string>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
