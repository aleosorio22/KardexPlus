// Debug utilities for production troubleshooting
export const debugRouterContext = () => {
  try {
    // Check if we're in a React Router context
    const context = React.useContext(require('react-router-dom').UNSAFE_RouteContext);
    console.log('Router Context:', context);
    return context;
  } catch (error) {
    console.error('Error accessing Router Context:', error);
    return null;
  }
};

export const debugAuth = (auth) => {
  console.log('Auth Debug:', {
    hasAuth: !!auth,
    hasToken: !!(auth?.token),
    hasUser: !!(auth?.user),
    userRole: auth?.user?.rol,
    timestamp: new Date().toISOString()
  });
};

export const debugEnvironment = () => {
  console.log('Environment Debug:', {
    NODE_ENV: import.meta.env.MODE,
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString()
  });
};

// Call this on app initialization in production
export const initializeProductionDebugging = () => {
  if (import.meta.env.PROD) {
    console.log('🚀 KardexPlus Frontend - Production Mode');
    debugEnvironment();
    
    // Log any unhandled router errors
    window.addEventListener('error', (event) => {
      if (event.error?.message?.includes('router') || event.error?.message?.includes('Router')) {
        console.error('Router Error Detected:', event.error);
        debugEnvironment();
      }
    });
  }
};
