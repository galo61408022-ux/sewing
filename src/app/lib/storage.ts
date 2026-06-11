import type { Customer, Order, Payment, InventoryItem, Staff, ActivityLog, Measurement } from './types';

interface StorageData {
  customers: Customer[];
  orders: Order[];
  payments: Payment[];
  inventory: InventoryItem[];
  staff: Staff[];
  activityLogs: ActivityLog[];
  measurements: Measurement[];
}

const STORAGE_KEY = 'ati_sewing_data';

export const storage = {
  /**
   * Export all data as a JSON-serializable object
   */
  exportAll(): StorageData {
    return {
      customers: JSON.parse(localStorage.getItem('ati_customers') || '[]'),
      orders: JSON.parse(localStorage.getItem('ati_orders') || '[]'),
      payments: JSON.parse(localStorage.getItem('ati_payments') || '[]'),
      inventory: JSON.parse(localStorage.getItem('ati_inventory') || '[]'),
      staff: JSON.parse(localStorage.getItem('ati_staff') || '[]'),
      activityLogs: JSON.parse(localStorage.getItem('ati_activityLogs') || '[]'),
      measurements: JSON.parse(localStorage.getItem('ati_measurements') || '[]'),
    };
  },

  /**
   * Import data from a JSON object
   */
  importAll(data: Partial<StorageData>): void {
    if (data.customers) localStorage.setItem('ati_customers', JSON.stringify(data.customers));
    if (data.orders) localStorage.setItem('ati_orders', JSON.stringify(data.orders));
    if (data.payments) localStorage.setItem('ati_payments', JSON.stringify(data.payments));
    if (data.inventory) localStorage.setItem('ati_inventory', JSON.stringify(data.inventory));
    if (data.staff) localStorage.setItem('ati_staff', JSON.stringify(data.staff));
    if (data.activityLogs) localStorage.setItem('ati_activityLogs', JSON.stringify(data.activityLogs));
    if (data.measurements) localStorage.setItem('ati_measurements', JSON.stringify(data.measurements));
  },

  /**
   * Get customers from storage
   */
  getCustomers(): Customer[] {
    return JSON.parse(localStorage.getItem('ati_customers') || '[]');
  },

  /**
   * Save customers to storage
   */
  saveCustomers(customers: Customer[]): void {
    localStorage.setItem('ati_customers', JSON.stringify(customers));
  },

  /**
   * Get orders from storage
   */
  getOrders(): Order[] {
    return JSON.parse(localStorage.getItem('ati_orders') || '[]');
  },

  /**
   * Save orders to storage
   */
  saveOrders(orders: Order[]): void {
    localStorage.setItem('ati_orders', JSON.stringify(orders));
  },

  /**
   * Get payments from storage
   */
  getPayments(): Payment[] {
    return JSON.parse(localStorage.getItem('ati_payments') || '[]');
  },

  /**
   * Save payments to storage
   */
  savePayments(payments: Payment[]): void {
    localStorage.setItem('ati_payments', JSON.stringify(payments));
  },

  /**
   * Get inventory from storage
   */
  getInventory(): InventoryItem[] {
    return JSON.parse(localStorage.getItem('ati_inventory') || '[]');
  },

  /**
   * Save inventory to storage
   */
  saveInventory(inventory: InventoryItem[]): void {
    localStorage.setItem('ati_inventory', JSON.stringify(inventory));
  },

  /**
   * Get staff from storage
   */
  getStaff(): Staff[] {
    return JSON.parse(localStorage.getItem('ati_staff') || '[]');
  },

  /**
   * Save staff to storage
   */
  saveStaff(staff: Staff[]): void {
    localStorage.setItem('ati_staff', JSON.stringify(staff));
  },

  /**
   * Get activity logs from storage
   */
  getActivityLogs(): ActivityLog[] {
    return JSON.parse(localStorage.getItem('ati_activityLogs') || '[]');
  },

  /**
   * Save activity logs to storage
   */
  saveActivityLogs(logs: ActivityLog[]): void {
    localStorage.setItem('ati_activityLogs', JSON.stringify(logs));
  },

  /**
   * Clear all data
   */
  clearAll(): void {
    localStorage.removeItem('ati_customers');
    localStorage.removeItem('ati_orders');
    localStorage.removeItem('ati_payments');
    localStorage.removeItem('ati_inventory');
    localStorage.removeItem('ati_staff');
    localStorage.removeItem('ati_activityLogs');
    localStorage.removeItem('ati_measurements');
  },

  /**
   * Get measurements from storage
   */
  getMeasurements(): Measurement[] {
    return JSON.parse(localStorage.getItem('ati_measurements') || '[]');
  },

  /**
   * Save measurements to storage
   */
  saveMeasurements(measurements: Measurement[]): void {
    localStorage.setItem('ati_measurements', JSON.stringify(measurements));
  },
};
