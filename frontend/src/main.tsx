import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppAuthProvider } from './lib/auth';
import { NotificationProvider } from './context/NotificationContext';
import App from './App';
import './styles/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry:     2,
      staleTime: 30_000,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AppAuthProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </AppAuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);
