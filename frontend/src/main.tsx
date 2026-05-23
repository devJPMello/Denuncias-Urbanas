import { createRoot } from 'react-dom/client';
import { AppAuthProvider } from './lib/auth';
import App from './App';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <AppAuthProvider>
    <App />
  </AppAuthProvider>
);
