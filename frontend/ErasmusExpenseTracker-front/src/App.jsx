import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound.jsx';
import Landing from './pages/Landing';
import PrivateRoute from "./components/PrivateRoute";
import NavBar from "./components/Navbar.jsx"
import Trips from "./pages/TripsPage.jsx";
import Profile from "./pages/Profile";
import Statistics from "./pages/StatsPage.jsx";
import { useAuth } from "./context/AuthContext"; 
import TransactionsPage from "./pages/Transactions";
import TransactionNew from './pages/TransactionNew.jsx';
import BudgetNew from "./pages/BudgetNew";
import TransactionEdit from './pages/TransactionEdit.jsx';
import TripNew from "./pages/TripNew";
import TripDetail from "./pages/TripDetail.jsx";
import TripEdit from "./pages/TripEdit";
import BudgetsPage from "./pages/BudgetsPage.jsx";
import BudgetEdit from "./pages/BudgetEdit.jsx";




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
          <Route path="/transactions/edit/:id" element={<TransactionEdit />} />
          <Route path="/trips/new" element={<TripNew />} />
          <Route path="/trips/:tripId" element={<TripDetail />} />
          <Route path="/trips/edit/:tripId" element={<TripEdit />} />
          <Route path="/budgets" element={<BudgetsPage />} />
          <Route path="/budgets/edit/:budgetId" element={<BudgetEdit />} />



        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
