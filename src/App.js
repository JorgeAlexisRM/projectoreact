import './App.css';
import { AuthProvider } from './context/AuthContext';
import Router1 from './routes/Router1';

function App() {
  return (
    <>
      <AuthProvider>
        <Router1/>
      </AuthProvider>
    </>
  );
}

export default App;
