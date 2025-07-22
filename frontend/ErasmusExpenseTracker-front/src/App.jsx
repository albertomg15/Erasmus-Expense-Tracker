import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound.jsx';
import Landing from './pages/Landing';
import PrivateRoute from "./components/PrivateRoute";
import NavBar from "./components/Navbar.jsx"
import Trips from "./pages/Trips";
import Profile from "./pages/Profile";
import Statistics from "./pages/Statistics.jsx";
import { useAuth } from "./context/AuthContext"; 
import TransactionsPage from "./pages/Transactions";
import TransactionNew from './pages/TransactionNew.jsx';
import BudgetNew from "./pages/BudgetNew";


function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      {isAuthenticated && <NavBar />} {/* 👈 Solo se muestra si estás autenticado */}
      
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />


        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/transactions/new" element={<TransactionNew />} />
          <Route path="/budgets/new" element={<BudgetNew />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
