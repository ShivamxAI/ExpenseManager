// components/sample.tsx
"use client"

import { useState } from "react"
import { useAccount } from "wagmi"
import { useExpenseContract } from "@/hooks/useContract"

const SampleIntregation = () => {
  const { isConnected } = useAccount()
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")

  const { data, actions, state } = useExpenseContract()

  const handleCreateExpense = async () => {
    if (!amount || !description) return

    try {
      await actions.createExpense(amount, description)
      setAmount("")
      setDescription("")
    } catch (err) {
      console.error("Error:", err)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <h2 className="text-2xl font-bold text-foreground mb-3">Expense Manager</h2>
          <p className="text-muted-foreground">
            Please connect your wallet to start tracking your on-chain expenses.
          </p>
        </div>
      </div>
    )
  }

  const canCreateExpense = !!amount && !!description

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Expense Manager</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Log and review your expenses directly on the Flare Coston2 testnet.
          </p>
        </div>

        {/* Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-2">
              Total Expenses (Units)
            </p>
            <p className="text-2xl font-semibold text-foreground">{data.totalExpenses}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-2">
              Number of Entries
            </p>
            <p className="text-2xl font-semibold text-foreground">{data.myExpenseCount}</p>
          </div>
        </div>

        {/* Create Expense */}
        <div className="space-y-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                1
              </span>
              <label className="block text-sm font-medium text-foreground">Add New Expense</label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="number"
                placeholder="Amount (e.g. 100)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <input
                type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <button
                onClick={handleCreateExpense}
                disabled={state.isLoading || state.isPending || !canCreateExpense}
                className="w-full px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {state.isLoading || state.isPending ? "Saving..." : "Add Expense"}
              </button>
            </div>
          </div>
        </div>

        {/* Expenses List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Your Expenses</h2>
          {data.expenses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No expenses recorded yet. Add your first expense to see it here.
            </p>
          ) : (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="grid grid-cols-3 gap-2 px-4 py-2 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <span>Amount</span>
                <span>Description</span>
                <span>Date</span>
              </div>
              <ul>
                {data.expenses.map((expense, index) => (
                  <li
                    key={`${expense.timestamp}-${index}`}
                    className="grid grid-cols-3 gap-2 px-4 py-2 border-t border-border text-sm"
                  >
                    <span className="font-mono">{expense.amount}</span>
                    <span className="truncate" title={expense.description}>
                      {expense.description}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(expense.timestamp * 1000).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Status Messages */}
        {state.hash && (
          <div className="mt-6 p-4 bg-card border border-border rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
              Transaction Hash
            </p>
            <p className="text-sm font-mono text-foreground break-all mb-3">{state.hash}</p>
            {state.isConfirming && <p className="text-sm text-primary">Waiting for confirmation...</p>}
            {state.isConfirmed && <p className="text-sm text-green-500">Transaction confirmed!</p>}
          </div>
        )}

        {state.error && (
          <div className="mt-6 p-4 bg-card border border-destructive rounded-lg">
            <p className="text-sm text-destructive-foreground">Error: {state.error.message}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SampleIntregation
