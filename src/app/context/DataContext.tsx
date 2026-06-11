import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { Customer, Order, Payment, InventoryItem, Staff, ActivityLog, StockMovement, Measurement } from '../lib/types';
import { storage } from '../lib/storage';
import { generateId } from '../lib/utils';

interface DataContextType {
  customers: Customer[];
  orders: Order[];
  payments: Payment[];
  inventory: InventoryItem[];
  staff: Staff[];
  activityLogs: ActivityLog[];
  stockMovements: StockMovement[];
  measurements: Measurement[];
  isLoading: boolean;
  error: string | null;
  addCustomer: (customer: Omit<Customer, 'id' | 'registrationDate'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => void;
  updatePayment: (id: string, updates: Partial<Payment>) => void;
  deletePayment: (id: string) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  addStockMovement: (movement: Omit<StockMovement, 'id' | 'createdAt'>) => void;
  addStaff: (staff: Omit<Staff, 'id' | 'createdAt'>) => void;
  updateStaff: (id: string, updates: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;
  addMeasurement: (measurement: Measurement) => void;
  updateMeasurement: (measurement: Measurement) => void;
  deleteMeasurement: (id: string) => void;
  logActivity: (action: string, target: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const data = storage.exportAll();
      setCustomers(data.customers);
      setOrders(data.orders);
      setPayments(data.payments);
      setInventory(data.inventory);
      setStaff(data.staff);
      setActivityLogs(data.activityLogs);
      setMeasurements(data.measurements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) storage.saveCustomers(customers);
  }, [customers, isLoading]);

  useEffect(() => {
    if (!isLoading) storage.saveOrders(orders);
  }, [orders, isLoading]);

  useEffect(() => {
    if (!isLoading) storage.savePayments(payments);
  }, [payments, isLoading]);

  useEffect(() => {
    if (!isLoading) storage.saveInventory(inventory);
  }, [inventory, isLoading]);

  useEffect(() => {
    if (!isLoading) storage.saveStaff(staff);
  }, [staff, isLoading]);

  useEffect(() => {
    if (!isLoading) storage.saveActivityLogs(activityLogs);
  }, [activityLogs, isLoading]);

  // Persist measurements
  useEffect(() => {
    if (!isLoading) storage.saveMeasurements(measurements);
  }, [measurements, isLoading]);

  const logActivity = useCallback((action: string, target: string) => {
    const log: ActivityLog = {
      id: generateId(),
      user: 'Current User',
      action,
      target,
      timestamp: new Date().toISOString(),
    };
    setActivityLogs(prev => [log, ...prev]);
  }, []);

  const addCustomer = useCallback((customer: Omit<Customer, 'id' | 'registrationDate'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: generateId(),
      registrationDate: new Date().toISOString(),
    };
    setCustomers(prev => [...prev, newCustomer]);
    logActivity('CREATE', `Customer: ${customer.name}`);
  }, [logActivity]);

  const updateCustomer = useCallback((id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    logActivity('UPDATE', `Customer: ${id}`);
  }, [logActivity]);

  const deleteCustomer = useCallback((id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    logActivity('DELETE', `Customer: ${id}`);
  }, [logActivity]);

  const addOrder = useCallback((order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newOrder: Order = {
      ...order,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setOrders(prev => [...prev, newOrder]);
    logActivity('CREATE', `Order: ${order.customerId}`);
  }, [logActivity]);

  const updateOrder = useCallback((id: string, updates: Partial<Order>) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o));
    logActivity('UPDATE', `Order: ${id}`);
  }, [logActivity]);

  const deleteOrder = useCallback((id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
    logActivity('DELETE', `Order: ${id}`);
  }, [logActivity]);

  const addPayment = useCallback((payment: Omit<Payment, 'id' | 'createdAt'>) => {
    const newPayment: Payment = {
      ...payment,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setPayments(prev => [...prev, newPayment]);
    logActivity('CREATE', `Payment: ${payment.orderId}`);
  }, [logActivity]);

  const updatePayment = useCallback((id: string, updates: Partial<Payment>) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    logActivity('UPDATE', `Payment: ${id}`);
  }, [logActivity]);

  const deletePayment = useCallback((id: string) => {
    setPayments(prev => prev.filter(p => p.id !== id));
    logActivity('DELETE', `Payment: ${id}`);
  }, [logActivity]);

  const addInventoryItem = useCallback((item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setInventory(prev => [...prev, newItem]);
    logActivity('CREATE', `Inventory: ${item.name}`);
  }, [logActivity]);

  const updateInventoryItem = useCallback((id: string, updates: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(i => i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i));
    logActivity('UPDATE', `Inventory: ${id}`);
  }, [logActivity]);

  const deleteInventoryItem = useCallback((id: string) => {
    setInventory(prev => prev.filter(i => i.id !== id));
    logActivity('DELETE', `Inventory: ${id}`);
  }, [logActivity]);

  const addStockMovement = useCallback((movement: Omit<StockMovement, 'id' | 'createdAt'>) => {
    const newMovement: StockMovement = {
      ...movement,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setStockMovements(prev => [...prev, newMovement]);
    logActivity('STOCK_MOVEMENT', `${movement.type}: ${movement.quantity}`);
  }, [logActivity]);

  const addStaff = useCallback((staffMember: Omit<Staff, 'id' | 'createdAt'>) => {
    const newStaff: Staff = {
      ...staffMember,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setStaff(prev => [...prev, newStaff]);
    logActivity('CREATE', `Staff: ${staffMember.name}`);
  }, [logActivity]);

  const updateStaff = useCallback((id: string, updates: Partial<Staff>) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    logActivity('UPDATE', `Staff: ${id}`);
  }, [logActivity]);

  const deleteStaff = useCallback((id: string) => {
    setStaff(prev => prev.filter(s => s.id !== id));
    logActivity('DELETE', `Staff: ${id}`);
  }, [logActivity]);

  // Measurement operations
  const addMeasurement = useCallback((measurement: Measurement) => {
    setMeasurements(prev => [...prev, measurement]);
    logActivity('CREATE', `Measurement: ${measurement.garmentType}`);
  }, [logActivity]);

  const updateMeasurement = useCallback((measurement: Measurement) => {
    setMeasurements(prev => prev.map(m => m.id === measurement.id ? measurement : m));
    logActivity('UPDATE', `Measurement: ${measurement.id}`);
  }, [logActivity]);

  const deleteMeasurement = useCallback((id: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
    logActivity('DELETE', `Measurement: ${id}`);
  }, [logActivity]);

  return (
    <DataContext.Provider
      value={{
        customers,
        orders,
        payments,
        inventory,
        staff,
        activityLogs,
        stockMovements,
        measurements,
        isLoading,
        error,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addOrder,
        updateOrder,
        deleteOrder,
        addPayment,
        updatePayment,
        deletePayment,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        addStockMovement,
        addStaff,
        updateStaff,
        deleteStaff,
        addMeasurement,
        updateMeasurement,
        deleteMeasurement,
        logActivity,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
