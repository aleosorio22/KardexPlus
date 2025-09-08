import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RouterTest() {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useAuth();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Router Test</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Location Info</h2>
            <pre className="bg-gray-100 p-2 rounded text-sm">
              {JSON.stringify(location, null, 2)}
            </pre>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Auth Status</h2>
            <pre className="bg-gray-100 p-2 rounded text-sm">
              {JSON.stringify(auth ? { token: '***', user: auth.user } : null, null, 2)}
            </pre>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Navigation Test</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Go to Dashboard
              </button>
              <button 
                onClick={() => navigate('/inventario/categorias')}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Go to Categories
              </button>
              <button 
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RouterTest;
