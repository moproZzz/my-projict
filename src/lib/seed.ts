import { collection, getDocs, addDoc, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from './firebase';
import { UserRole } from '../types';

export const seedData = async () => {
  const productSnap = await getDocs(collection(db, 'products'));
  if (!productSnap.empty) return; // Don't seed if already has data

  console.log('Seeding initial data...');

  // Create default admin if not exists (This needs the user to sign up first usually)
  // For the demo, we expect the first user to be auto-promoted to admin in a real app logic
  // but for now we'll just seed products.

  const categories = [
    { name: 'إلكترونيات', description: 'أجهزة ذكية وحواسيب' },
    { name: 'أجهزة منزلية', description: 'أدوات المطبخ والمنزل' },
    { name: 'إكسسوارات', description: 'ملحقات متنوعة' }
  ];

  const catIds: string[] = [];
  for (const cat of categories) {
    const docRef = await addDoc(collection(db, 'categories'), cat);
    catIds.push(docRef.id);
  }

  const products = [
    { name: 'آيفون ١٤ برو ماكس', categoryId: catIds[0], purchasePrice: 4000, sellingPrice: 4800, stock: 15, barcode: '123456789', minStockAlert: 5 },
    { name: 'سامسونج S23 الترا', categoryId: catIds[0], purchasePrice: 3800, sellingPrice: 4500, stock: 10, barcode: '987654321', minStockAlert: 3 },
    { name: 'سماعات آبل ايربودز', categoryId: catIds[2], purchasePrice: 700, sellingPrice: 950, stock: 25, barcode: '554433221', minStockAlert: 10 },
    { name: 'ماكينة قهوة ديلونجي', categoryId: catIds[1], purchasePrice: 1200, sellingPrice: 1650, stock: 5, barcode: '112233445', minStockAlert: 2 },
    { name: 'شاشة سامسونج ٥٥ بوصة', categoryId: catIds[0], purchasePrice: 1800, sellingPrice: 2400, stock: 8, barcode: '223344556', minStockAlert: 2 }
  ];

  for (const prod of products) {
    await addDoc(collection(db, 'products'), { ...prod, updatedAt: new Date().toISOString() });
  }

  console.log('Seed completed!');
};
