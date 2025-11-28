// hooks/useContract.ts
"use client"

import { useState, useEffect } from "react"
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
    query: {
      enabled: !!address,
    },
  })

  const { data: myTotalExpenses, refetch: refetchTotalExpenses } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "getMyTotalExpenses",
    query: {
      enabled: !!address,
    },
  })

  const { writeContractAsync, data: hash, error, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    if (isConfirmed) {
      refetchExpenseCount()
      refetchTotalExpenses()
    }
  }, [isConfirmed, refetchExpenseCount, refetchTotalExpenses])

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!address || !publicClient || !myExpenseCount) {
        setExpenses([])
        return
      }

      const count = Number(myExpenseCount as bigint)
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
        })) as [bigint, string, bigint]

        const [amount, description, timestamp] = result

        items.push({
          amount: amount.toString(),
          description,
          timestamp: Number(timestamp),
        })
      }

      setExpenses(items)
    }

    fetchExpenses().catch((err) => {
      console.error("Error fetching expenses:", err)
    })
  }, [address, publicClient, myExpenseCount])

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
    } catch (err) {
      console.error("Error creating expense:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const data: ContractData = {
    myExpenseCount: myExpenseCount ? Number(myExpenseCount as bigint) : 0,
    totalExpenses: myTotalExpenses ? (myTotalExpenses as bigint).toString() : "0",
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
