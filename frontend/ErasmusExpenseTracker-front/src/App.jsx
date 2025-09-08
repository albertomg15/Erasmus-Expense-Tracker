import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound.jsx";
import Landing from "./pages/Landing";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar.jsx";
import Trips from "./pages/TripsPage.jsx";
import Profile from "./pages/Profile";
import Statistics from "./pages/StatsPage.jsx";
import { useAuth } from "./context/AuthContext";
import TransactionsPage from "./pages/Transactions";
import TransactionNew from "./pages/TransactionNew.jsx";
import BudgetNew from "./pages/BudgetNew";
import TransactionEdit from "./pages/TransactionEdit.jsx";
import TripNew from "./pages/TripNew";
import TripDetail from "./pages/TripDetail.jsx";
import TripEdit from "./pages/TripEdit";
import BudgetsPage from "./pages/BudgetsPage.jsx";
import BudgetEdit from "./pages/BudgetEdit.jsx";
import CountryComparison from "./pages/CountryComparison.jsx";
import BottomNav from "./components/BottomNav.jsx";

function PrivateShell() {
  return (
    <div className="min-h-dvh bg-gray-50">
      <Navbar />
      <main className="pt-12 md:pt-14 pb-16 md:pb-0">
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

function App() {
  useAuth(); // asegura contexto
  return (
    <BrowserRouter>
      <Routes>
        {/* públicas */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* privadas con shell responsive */}
        <Route element={<PrivateRoute />}>
          <Route element={<PrivateShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/transactions/new" element={<TransactionNew />} />
            <Route path="/transactions/edit/:id" element={<TransactionEdit />} />
            <Route path="/budgets" element={<BudgetsPage />} />
            <Route path="/budgets/new" element={<BudgetNew />} />
            <Route path="/budgets/edit/:budgetId" element={<BudgetEdit />} />
            <Route path="/trips/new" element={<TripNew />} />
            <Route path="/trips/:tripId" element={<TripDetail />} />
            <Route path="/trips/edit/:tripId" element={<TripEdit />} />
            <Route path="/comparison" element={<CountryComparison />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
