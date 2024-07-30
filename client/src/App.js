import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from "chart.js";
import "./App.css"; // Import CSS for styling

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

// Login Component
const Login = ({ onLogin }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(username, password);
    };

    return (
        <div className="login-container">
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

// Expenses Component
const Expenses = ({ token }) => {
    const [expenses, setExpenses] = useState([]);
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [editingExpenseId, setEditingExpenseId] = useState(null);
    const [editDescription, setEditDescription] = useState("");
    const [editAmount, setEditAmount] = useState("");

    useEffect(() => {
        if (token) {
            axios
                .get("http://localhost:5000/api/expenses", {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((response) => setExpenses(response.data))
                .catch((err) => console.log(err));
        }
    }, [token]);

    const addExpense = () => {
        axios
            .post(
                "http://localhost:5000/api/expenses",
                { description, amount },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            .then((response) => {
                setExpenses([...expenses, response.data]);
                setDescription("");
                setAmount("");
            })
            .catch((err) => console.log(err));
    };

    const updateExpense = (id) => {
        axios
            .put(
                `http://localhost:5000/api/expenses/${id}`,
                { description: editDescription, amount: editAmount },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            .then((response) => {
                setExpenses(
                    expenses.map((expense) =>
                        expense._id === id ? response.data : expense
                    )
                );
                setEditingExpenseId(null);
                setEditDescription("");
                setEditAmount("");
            })
            .catch((err) => console.log(err));
    };

    const startEdit = (expense) => {
        setEditingExpenseId(expense._id);
        setEditDescription(expense.description);
        setEditAmount(expense.amount);
    };

    const deleteExpense = (id) => {
        axios
            .delete(`http://localhost:5000/api/expenses/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(() => {
                setExpenses(expenses.filter((expense) => expense._id !== id));
            })
            .catch(() => console.log("Error deleting expense"));
    };

    // Calculate total expense and category distribution
    const totalExpense = expenses.reduce(
        (total, expense) => total + expense.amount,
        0
    );
    const categoryData = expenses.reduce((acc, expense) => {
        acc[expense.description] =
            (acc[expense.description] || 0) + expense.amount;
        return acc;
    }, {});

    const barChartData = {
        labels: expenses.map((exp) => exp.description),
        datasets: [
            {
                label: "Expense Amount",
                data: expenses.map((exp) => exp.amount),
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
            },
        ],
    };

    const pieChartData = {
        labels: Object.keys(categoryData),
        datasets: [
            {
                data: Object.values(categoryData),
                backgroundColor: [
                    "rgba(255, 99, 132, 0.2)",
                    "rgba(54, 162, 235, 0.2)",
                    "rgba(255, 206, 86, 0.2)",
                    "rgba(75, 192, 192, 0.2)",
                    "rgba(153, 102, 255, 0.2)",
                    "rgba(255, 159, 64, 0.2)",
                ],
                borderColor: [
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(75, 192, 192, 1)",
                    "rgba(153, 102, 255, 1)",
                    "rgba(255, 159, 64, 1)",
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="expenses-container">
            <h1>Expense Tracker</h1>
            <div className="form-container">
                <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description"
                />
                <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    type="number"
                    placeholder="Amount"
                />
                <button onClick={addExpense}>Add Expense</button>
            </div>
            <div className="chart-container">
                <div className="chart-card">
                    <h2>Expenses by Category</h2>
                    <Pie data={pieChartData} />
                </div>
                <div className="chart-card">
                    <h2>Expenses Overview</h2>
                    <Bar
                        data={barChartData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: { position: "top" },
                                title: {
                                    display: true,
                                    text: "Expense Overview",
                                },
                            },
                        }}
                    />
                </div>
            </div>
            <div className="expense-cards">
                {expenses.map((expense) => (
                    <div key={expense._id} className="expense-card">
                        {editingExpenseId === expense._id ? (
                            <div className="edit-form">
                                <input
                                    value={editDescription}
                                    onChange={(e) =>
                                        setEditDescription(e.target.value)
                                    }
                                    placeholder="Description"
                                />
                                <input
                                    value={editAmount}
                                    onChange={(e) =>
                                        setEditAmount(e.target.value)
                                    }
                                    type="number"
                                    placeholder="Amount"
                                />
                                <button
                                    onClick={() => updateExpense(expense._id)}
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setEditingExpenseId(null)}
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <>
                                <h3>{expense.description}</h3>
                                <p>${expense.amount.toFixed(2)}</p>
                                <div className="card-buttons">
                                    <button onClick={() => startEdit(expense)}>
                                        Edit
                                    </button>
                                    <button
                                        onClick={() =>
                                            deleteExpense(expense._id)
                                        }
                                    >
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
            <h2>Total Expense: ${totalExpense.toFixed(2)}</h2>
        </div>
    );
};

// Main App Component
const App = () => {
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [isLoggedIn, setIsLoggedIn] = useState(!!token);
    const [error, setError] = useState(null);

    const handleLogin = useCallback((username, password) => {
        axios
            .post("http://localhost:5000/api/users/login", {
                username,
                password,
            })
            .then((response) => {
                localStorage.setItem("token", response.data.token);
                setToken(response.data.token);
                setIsLoggedIn(true);
                setError(null); // Clear any previous errors
            })
            .catch(() => {
                setError("Login failed. Please try again.");
            });
    }, []);

    return (
        <Router>
            <div>
                <Routes>
                    <Route
                        path="/login"
                        element={
                            isLoggedIn ? (
                                <Expenses token={token} />
                            ) : (
                                <Login onLogin={handleLogin} />
                            )
                        }
                    />
                    <Route
                        path="/"
                        element={
                            isLoggedIn ? (
                                <Expenses token={token} />
                            ) : (
                                <Login onLogin={handleLogin} />
                            )
                        }
                    />
                </Routes>
                {error && <div className="error">{error}</div>}
            </div>
        </Router>
    );
};

export default App;
