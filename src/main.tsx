import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { seedData } from './lib/seed.ts';

// Optional: seed data in development
if (process.env.NODE_ENV !== 'production') {
  seedData();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
