import './App.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Router1 from './routes/Router1';

function App() {
  return (
    <>
      <AuthProvider>
        <CartProvider> 
          <Router1/>
        </CartProvider>
      </AuthProvider>
    </>
  );
}

export default App;
