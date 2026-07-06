import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { DepositList } from './pages/DepositList';
import { AddEditDeposit } from './pages/AddEditDeposit';
import { ExpenseList } from './pages/ExpenseList';
import { AddEditExpense } from './pages/AddEditExpense';
import { Profile } from './pages/Profile';
import { Statistics } from './pages/Statistics';
import { StockNews } from './pages/StockNews';
import { TabBar } from './components/TabBar';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#F8F9FA]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/deposits" element={<DepositList />} />
          <Route path="/add" element={<AddEditDeposit />} />
          <Route path="/edit/:id" element={<AddEditDeposit />} />
          <Route path="/expenses" element={<ExpenseList />} />
          <Route path="/add-expense" element={<AddEditExpense />} />
          <Route path="/edit-expense/:id" element={<AddEditExpense />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/news" element={<StockNews />} />
        </Routes>
        <TabBar />
      </div>
    </Router>
  );
}
