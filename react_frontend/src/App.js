// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Transactions from './components/Transactions';
import Budgets from './components/Budgets';
import Registration from './components/Registration';
import Login from './components/Login';
import LandingPage from './components/LandingPage';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  
  // fetch data from the server
  useEffect(() => {
  fetch('/transactions')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response not okay');
      }
      return response.json();
    })
    .then(data => {
      if (!data) {
        throw new Error('Empty response received');
      }
      setTransactions(data);
    })
    .catch(error => console.error('Error fetching transactions:', error));
  
  fetch('/budgets')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response not okay');
      }
      return response.json();
    })
    .then(data => {
      if (!data) {
        throw new Error('Empty response received');
      }
      setBudgets(data);
    })
    .catch(error => console.error('Error fetching budgets:', error));
}, []);
  
  return (
    <Router basename="/finance_tracker">
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/transactions" element={<Transactions transactions={transactions} />} />
          <Route path="/budgets" element={<Budgets budgets={budgets} />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
