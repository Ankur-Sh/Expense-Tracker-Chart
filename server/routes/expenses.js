const express = require("express");
const Expense = require("../models/Expense");
const router = express.Router();

// Get all expenses
router.get("/", async (req, res) => {
    try {
        const expenses = await Expense.find({ userId: req.user.id });
        res.json(expenses);
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: "Error fetching expenses" });
    }
});

// Add expense
router.post("/", async (req, res) => {
    const { description, amount } = req.body;
    try {
        const expense = new Expense({
            userId: req.user.id,
            description,
            amount,
        });
        await expense.save();
        res.status(201).json(expense);
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: "Error adding expense" });
    }
});

// Edit expense
router.put("/:id", async (req, res) => {
    const { description, amount } = req.body;
    try {
        const expense = await Expense.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { description, amount },
            { new: true } // Return the updated document
        );
        if (!expense) {
            return res.status(404).json({ error: "Expense not found" });
        }
        res.status(200).json(expense);
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: "Error updating expense" });
    }
});

// Delete expense
router.delete("/:id", async (req, res) => {
    try {
        const expense = await Expense.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id,
        });
        if (!expense) {
            return res.status(404).json({ error: "Expense not found" });
        }
        res.status(200).json({ message: "Expense deleted" });
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: "Error deleting expense" });
    }
});

module.exports = router;
