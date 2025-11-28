# 🧾 Expense Manager – Solidity Smart Contract

A simple and beginner-friendly **Expense Manager** built using **Solidity**.  
This smart contract allows users to record, view, and calculate their expenses directly on the blockchain.  
Perfect for learning how mappings, structs, arrays, and events work in Solidity.

---

## 📘 Project Description

The **Expense Manager** is a decentralized expense-tracking tool designed to help users store expense data securely using blockchain technology.  

Each user has their own isolated expense list, and no data is shared across users.  
The contract requires **no input fields during deployment**, keeping it extremely simple for beginners.

---
<img width="1876" height="910" alt="image" src="https://github.com/user-attachments/assets/bd82c767-c393-450d-a806-f7fe776d2cd6" />


## 🔧 What This Contract Does

✔ Allows users to add expenses (amount + description)  
✔ Stores each expense with an automatic timestamp  
✔ Keeps every user’s expenses private to their own address  
✔ Returns total expenses and a list of all expenses  
✔ Emits events whenever a new expense is added  

---

## ✨ Features

- **Add Expense**  
  Users can add a new expense with an amount and short description.

- **View Expense Count**  
  Retrieve how many expenses the user has added.

- **Get Expense by Index**  
  Fetch details of any specific expense.

- **Calculate Total Expenses**  
  The contract loops through all expenses and returns the total amount.

- **No Deployment Inputs**  
  Anyone can deploy the contract instantly with no setup values.

---

## 📜 Smart Contract Code

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Simple Expense Manager
/// @author You :)
/// @notice Basic personal expense tracker for each user (msg.sender)
contract ExpenseManager {

    // Represents a single expense
    struct Expense {
        uint256 amount;        // Amount in smallest unit (e.g., cents or wei-like unit)
        string description;    // What this expense was for
        uint256 timestamp;     // When it was added
    }

    // Each user (address) has their own list of expenses
    mapping(address => Expense[]) private expensesOfUser;

    // Event emitted whenever a new expense is added
    event ExpenseAdded(
        address indexed user,
        uint256 amount,
        string description,
        uint256 timestamp
    );

    // No constructor arguments → no input fields during deployment
    constructor() {}

    /// @notice Add a new expense
    function addExpense(uint256 amount, string calldata description) external {
        require(amount > 0, "Amount must be > 0");

        Expense memory newExpense = Expense({
            amount: amount,
            description: description,
            timestamp: block.timestamp
        });

        expensesOfUser[msg.sender].push(newExpense);

        emit ExpenseAdded(msg.sender, amount, description, block.timestamp);
    }

    /// @notice Get total number of expenses for the caller
    function getMyExpenseCount() external view returns (uint256) {
        return expensesOfUser[msg.sender].length;
    }

    /// @notice Get a specific expense of the caller by index
    function getMyExpense(uint256 index)
        external
        view
        returns (uint256 amount, string memory description, uint256 timestamp)
    {
        require(index < expensesOfUser[msg.sender].length, "Invalid index");

        Expense storage e = expensesOfUser[msg.sender][index];
        return (e.amount, e.description, e.timestamp);
    }

    /// @notice Get the sum of all your expenses
    function getMyTotalExpenses() external view returns (uint256 total) {
        Expense[] storage list = expensesOfUser[msg.sender];

        for (uint256 i = 0; i < list.length; i++) {
            total += list[i].amount;
        }
    }
}
