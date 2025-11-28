# On-Chain Expense Manager (Flare Coston2)

## Contract Address

- **Address**: `0xe184F71155637560182284262e355eAfe5490A1c`  
- **Explorer**: https://coston2-explorer.flare.network/address/0xe184F71155637560182284262e355eAfe5490A1c
<img width="1893" height="919" alt="image" src="https://github.com/user-attachments/assets/7cdbbeeb-f885-49ab-9e31-e0d5a367adfa" />

---

## Description

The **On-Chain Expense Manager** is a simple, beginner-friendly decentralized application (dApp) built around a Solidity smart contract deployed on the **Flare Coston2 testnet**.

Its primary goal is to demonstrate how users can:

- Persist personal financial data (expenses) directly on-chain.
- Interact with a smart contract from a modern frontend using **wagmi** and **viem**.
- Learn core concepts such as mappings, structs, events, and contract reads/writes in a clear, approachable way.

Each connected wallet address maintains its **own isolated expense history**. The contract does not manage shared/global expenses. Instead, it acts as a personal expense ledger per user, where all entries are permanently recorded on-chain.

This project is well-suited for:

- Developers new to Solidity and web3 frontend integration.
- Hackathon or workshop demos for expense tracking or simple financial tools.
- Learning how to connect UI actions to smart contract calls (create + read data).

---

## Features

### 1. Per-User Expense Tracking

- Each wallet address gets its **own list of expenses**.
- Expenses are stored as a `struct` with:
  - `amount` – numeric value representing the expense in arbitrary units (e.g., tokens, points, or fiat-like units).
  - `description` – a short text explaining the nature of the expense.
  - `timestamp` – when the expense was recorded on-chain.

Because expenses are mapped by `msg.sender`, users can only read their own entries via the public getters.

---

### 2. Add New Expense On-Chain

- Users can create a new expense via the `addExpense(uint256 amount, string description)` function.
- Amount is validated on-chain:
  - Must be greater than zero.
- Each successful call:
  - Appends the new expense to the caller’s personal expense list.
  - Emits an `ExpenseAdded` event with the user address, amount, description, and timestamp.

This ensures that off-chain indexers or listeners can react to new expense records, and you can build more advanced analytics or dashboards on top if desired.

---

### 3. View Total Expenses

The contract provides a read-only function:

- `getMyTotalExpenses()` → returns a single `uint256` representing the **sum of all amounts** recorded by the caller.

This enables the frontend to quickly display a “Total Spent” overview without having to manually aggregate values off-chain.

---

### 4. Retrieve Expense Metadata

The contract exposes user-friendly read functions:

- `getMyExpenseCount()` – returns how many expenses the caller has recorded.
- `getMyExpense(uint256 index)` – returns the details of a specific expense by index (amount, description, timestamp).

On the frontend, these functions are used to:

- Determine how many individual entries to display.
- Fetch and render all expenses belonging to the connected wallet.
- Present a detailed history view to the user.

---

### 5. Modern Frontend Integration (wagmi + viem)

The project includes a sample React component and hook setup that demonstrates:

- Connecting a wallet using **wagmi**.
- Reading contract state:
  - Total expenses
  - Number of entries
  - Individual expense items
- Writing to the contract by:
  - Invoking `addExpense` from the UI.
  - Handling loading, confirmation, and error states for user feedback.

This makes the repository a practical example of **full-stack web3**: Solidity contract + TypeScript/React UI + wagmi integrations.

---

## How It Solves the Problem

### The Problem

Traditional expense tracking tools:

- Are usually centralized, storing your data on third-party servers.
- Require trust in an application provider or company.
- Often lack transparency or verifiability about how your data is stored or processed.

For developers learning web3, there is also a gap in:

- Simple, real-world examples that are easy to read and extend.
- Clear separation between contract logic and frontend logic.
- Demonstrations that show how to go from a Solidity file to a live, interactive dApp.

---

### The Solution

The **On-Chain Expense Manager** addresses these issues by:

1. **Putting Expense Data on the Blockchain**

   - Every expense you record is stored immutably on a public blockchain (Coston2 testnet).
   - This provides transparency, verifiability, and durability.
   - No central server or account system is required—your wallet is your identity.

2. **User-Isolated Ledgers**

   - The contract uses a mapping `mapping(address => Expense[])` to associate an independent ledger with each wallet.
   - Users cannot accidentally read or interfere with another user’s data via the provided public functions.
   - This models a simple, private, user-centric accounting system.

3. **Clear and Minimal Smart Contract Design**

   - The contract avoids complexity:
     - No constructor arguments.
     - Simple public view functions.
     - One main write function (`addExpense`).
   - This makes it ideal for people new to Solidity who want to understand contract storage, events, and basic function calls.

4. **Educational Frontend Integration**

   - The React-based UI shows how to:
     - Connect a wallet.
     - Call read/write functions using wagmi.
     - Reflect loading, transaction hash, and confirmation state in the interface.
   - The codebase acts as a reference implementation for future projects:
     - Replace the contract and ABI to adapt it to other use cases.
     - Extend the UI to add filtering, categories, or export features.

---

### Example Use Cases

- **Personal Learning Project**  
  Clone the repo, deploy your own version of the contract, and experiment with modifying the logic (e.g., adding categories, currencies, or tags).

- **Hackathons / Workshops**  
  Use this project as a base to build more advanced financial tools such as budget planners, shared group expense trackers, or integration with token-based payment flows.

- **Portfolio Project**  
  Present it as a demonstration of:
  - Smart contract development.
  - Wallet-based authentication.
  - Web3 frontend skills using TypeScript and modern tooling.

---

### Benefits

- **Transparency & Ownership**: Users own their data via their wallet; nothing is hidden behind a centralized backend.
- **Simplicity**: The contract and code are intentionally kept small and readable.
- **Extendability**: Easy to enhance with new fields (e.g., categories, tags), analytics, or integrations.
- **Educational Value**: Ideal stepping stone from tutorials into building real, end-to-end decentralized applications.

---

For developers, this project serves both as a **learning resource** and a **foundation** to build more sophisticated web3 financial tools on Flare and beyond.


#
