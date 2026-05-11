export enum UserRole {
  ADMIN = 'admin',
  EMPLOYEE = 'employee'
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  image?: string;
  barcode?: string;
  minStockAlert: number;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Sale {
  id: string;
  customerId?: string;
  customerName?: string;
  items: SaleItem[];
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: string;
  createdAt: any; // Firestore Timestamp
  invoiceNumber: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
}

export enum StockMovementType {
  IN = 'in',
  OUT = 'out',
  AUDIT = 'audit'
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantity: number;
  reason: string;
  userId: string;
  userName: string;
  createdAt: any;
}

export interface SystemSettings {
  companyName: string;
  currency: string;
  taxRate: number;
  logo?: string;
}
