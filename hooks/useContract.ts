// hooks/useContract.ts
"use client"

import { useState, useEffect, useCallback } from "react"
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from "wagmi"
import { contractABI, contractAddress } from "@/lib/contract"

export interface ExpenseItem {
  amount: string
  description: string
  timestamp: number
}

export interface ContractData {
  myExpenseCount: number
  totalExpenses: string
  expenses: ExpenseItem[]
}

export interface ContractState {
  isLoading: boolean
  isPending: boolean
  isConfirming: boolean
  isConfirmed: boolean
  hash: `0x${string}` | undefined
  error: Error | null
}

export interface ContractActions {
  createExpense: (amount: string, description: string) => Promise<void>
}

export const useExpenseContract = () => {
  const { address } = useAccount()
  const publicClient = usePublicClient()

  const [isLoading, setIsLoading] = useState(false)
  const [expenses, setExpenses] = useState<ExpenseItem[]>([])

const { data: myExpenseCount, refetch: refetchExpenseCount } = useReadContract({
  address: contractAddress,
  abi: contractABI,
  functionName: "getMyExpenseCount",
  account: address,          
  query: {
    enabled: !!address,
  },
})


const { data: myTotalExpenses, refetch: refetchTotalExpenses } = useReadContract({
  address: contractAddress,
  abi: contractABI,
  functionName: "getMyTotalExpenses",
  account: address,          
  query: {
    enabled: !!address,
  },
})


  const { writeContractAsync, data: hash, error, isPending } = useWriteContract()

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
  })

  // ✅ reusable function to load expenses from the contract
  const fetchExpenses = useCallback(async () => {
    if (!address || !publicClient) {
      setExpenses([])
      return
    }

    // we can trust myExpenseCount if it exists, otherwise read directly
    let countBn: bigint

    if (typeof myExpenseCount === "bigint") {
      countBn = myExpenseCount
    } else {
      const result = (await publicClient.readContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "getMyExpenseCount",
        account: address,
      })) as bigint
      countBn = result
    }

    const count = Number(countBn)
    if (count === 0) {
      setExpenses([])
      return
    }

    const items: ExpenseItem[] = []

    for (let i = 0; i < count; i++) {
      const result = (await publicClient.readContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "getMyExpense",
        args: [BigInt(i)],
        account: address,
      })) as [bigint, string, bigint]

      const [amount, description, timestamp] = result

      items.push({
        amount: amount.toString(),     // or formatUnits if you want decimals
        description,
        timestamp: Number(timestamp),
      })
    }

    setExpenses(items)
  }, [address, publicClient, myExpenseCount])

  // 🔁 whenever tx confirms, refresh everything (counts + expenses list)
  useEffect(() => {
    if (isConfirmed) {
      refetchExpenseCount()
      refetchTotalExpenses()
      fetchExpenses() // 👈 important
    }
  }, [isConfirmed, refetchExpenseCount, refetchTotalExpenses, fetchExpenses])

  // initial load + reload when account / client / count changes
  useEffect(() => {
    fetchExpenses().catch((err) => {
      console.error("Error fetching expenses:", err)
    })
  }, [fetchExpenses])

  const createExpense = async (amount: string, description: string) => {
    if (!amount || !description) return

    let parsedAmount: bigint
    try {
      parsedAmount = BigInt(amount)
    } catch (e) {
      console.error("Invalid amount value:", e)
      throw e
    }

    if (parsedAmount <= BigInt(0)) return

    try {
      setIsLoading(true)
      await writeContractAsync({
        address: contractAddress,
        abi: contractABI,
        functionName: "addExpense",
        args: [parsedAmount, description],
      })
      // we let the useWaitForTransactionReceipt + useEffect handle reload
    } catch (err) {
      console.error("Error creating expense:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const data: ContractData = {
    myExpenseCount: myExpenseCount ? Number(myExpenseCount as bigint) : 0,
    totalExpenses: myTotalExpenses
      ? (myTotalExpenses as bigint).toString()
      : "0",
    expenses,
  }

  const actions: ContractActions = {
    createExpense,
  }

  const state: ContractState = {
    isLoading: isLoading || isPending || isConfirming,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    error,
  }

  return {
    data,
    actions,
    state,
  }
}
