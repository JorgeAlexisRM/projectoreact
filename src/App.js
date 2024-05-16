import './App.css';
import NavBar from './components/navbar/NavBar';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Router1 from './routes/Router1';

function App() {
  return (
    <>
      <AuthProvider>
        <CartProvider>
          <NavBar/>
          <Router1/>
        </CartProvider>
      </AuthProvider>
    </>
  );
}

export default App;
