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

    // ✅ No constructor arguments → no input fields during deployment
    constructor() {}

    /// @notice Add a new expense
    /// @param amount The amount of the expense (you decide the unit: e.g., plain number, cents, etc.)
    /// @param description A short note about the expense
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
    /// @param index The index in your expense list (0-based)
    function getMyExpense(uint256 index)
        external
        view
        returns (
            uint256 amount,
            string memory description,
            uint256 timestamp
        )
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
