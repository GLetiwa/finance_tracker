import React, { useState, useEffect } from 'react';
import './styles.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    Category: '',
    Amount: '',
    Description: '',
    TransactionID: ''
  });

  const [successMessage, setSuccessMessage] = useState('');
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction({ ...newTransaction, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        Category: newTransaction.Category,
        Amount: newTransaction.Amount,
        Description: newTransaction.Description,
      };

      if (!payload.Amount || payload.Amount === 0) {
        console.error('Amount cannot be empty or zero');
        return;
    }
    const response = await fetch('/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      const addedTransaction = await response.json();
      setTransactions([...transactions, addedTransaction]);
      setSuccessMessage('Transaction successfully added!');
      setNewTransaction({ // Reset form fields after successful addition
        Category: '',
        Amount: '',
        Description: '',
        TransactionID: ''
      });
      console.log('Transaction successfully added!');
    } else {
	console.error('Failed to add transaction');
        }
    } catch (error) {
	    console.error('Error adding transaction:', error);
    }
  };

  const handleUpdate = async (transactionId) => {
    try {
      const response = await fetch(`/transactions/${transactionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newTransaction),
      });

      if (response.ok) {
        const updatedTransaction = await response.json();
        const updatedTransactions = transactions.map((t) =>
          t.TransactionID === transactionId ? updatedTransaction : t
        );
        setTransactions(updatedTransactions);
        console.log('Transaction updated successfully!');
      } else {
        console.error('Failed to update transaction');
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const handleDelete = async (transactionId) => {
    try {
      const response = await fetch(`/transactions/${transactionId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        const updatedTransactions = transactions.filter((t) => t.TransactionID !== transactionId);
        setTransactions(updatedTransactions);
        console.log('Transaction deleted successfully!');
      } else {
        console.error('Failed to delete transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/transactions');

        if (!response.ok) {
          throw new Error(`Network response was not ok (status: ${response.status})`);
        }

        const data = await response.json();
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="section">
      <h2>Transactions</h2>
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      <form onSubmit={handleSubmit} className="transaction-form">
        <label>
          Category:
          <input
            type="text"
            name="Category"
            value={newTransaction.Category}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Amount:
          <input
            type="number"
            name="Amount"
            value={newTransaction.Amount}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Description:
          <input
            type="text"
            name="Description"
            value={newTransaction.Description}
            onChange={handleInputChange}
          />
        </label>
        <button type="submit">Add Transaction</button>
      </form>
      <ul className="transaction-list">
        {transactions.map((transaction) => (
          <li key={transaction.TransactionID} className="transaction-item">
            <strong>{transaction.Category}</strong> - {transaction.Amount} USD
            <button onClick={() => handleUpdate(transaction.TransactionID)}>Update</button>
            <button onClick={() => handleDelete(transaction.TransactionID)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Transactions;
