import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/AppRouter';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
