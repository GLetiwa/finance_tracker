import React, { useState, useEffect } from 'react';
import './styles.css';
const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [newBudget, setNewBudget] = useState({
    Category: '',
    Amount: '',
    StartDate: '',
    EndDate: '',
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBudget({ ...newBudget, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
	  const payload = {
            Category: newBudget.Category,
            Amount: newBudget.Amount,
	    StartDate: newBudget.StartDate,
	    EndDate: newBudget.EndDate,
        };
	if (!payload.Amount || payload.Amount === 0) {
          console.error('Amount cannot be empty or zero');
	  return;
    }
	  const response = await fetch('/budgets', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials:'include',
		body: JSON.stringify(payload),
	});
	if (response.ok) {
	  const addedBudget = await response.json();
	  setBudgets([...budgets, addedBudget]);
	  setSuccessMessage('Budget successfully added!');
          setNewBudget({
            Category: '',
            Amount: '',
            StartDate: '',
            EndDate: '',
        });
	  console.log('Budget created successfully!');
	} else {
		console.error('Failed to create budget:', response.statusText);
	}
    } catch (error) {
	    console.error('An error occurred:', error);
	    setErrorMessage('An error occurred while adding the budget. Please try again later.');
    }
  };

  useEffect(() => {
  fetch('/budgets')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (!data || !Array.isArray(data)) {
	throw new Error('Invalid response format');
      }
      const formattedBudgets = data.map(budget => ({
      Category: budget.Category,
      Amount: budget.Amount,
      StartDate: budget.StartDate.strftime('%m-%d-%Y'),
      EndDate: budget.EndDate.strftime('%m-%d-%Y'),
  }));
  setBudgets(formattedBudgets);
      })
    .catch(error => console.error('Error fetching budgets:', error));
}, []);
  return (
    <div className="section">
      <h2>Budgets</h2>
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <form onSubmit={handleSubmit} className="budget-form">
        <label>
          Category:
          <input
            type="text"
            name="Category"
            value={newBudget.Category}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Amount:
          <input
            type="number"
            name="Amount"
            value={newBudget.Amount}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Start Date:
          <input
            type="date"
            name="StartDate"
            value={newBudget.StartDate}
            onChange={handleInputChange}
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            name="EndDate"
            value={newBudget.EndDate}
            onChange={handleInputChange}
          />
        </label>
        <button type="submit">Add Budget</button>
      </form>
      <ul className="budget-list">
        {budgets.map((budget) => (
          <li key={budget.BudgetID} className="budget-item">
            <strong>{budget.Category}</strong> - {budget.Amount} USD
	    <br />
	    Start Date: {new Date(budget.StartDate).toLocaleDateString()}, End Date: {new Date(budget.EndDate).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Budgets;
