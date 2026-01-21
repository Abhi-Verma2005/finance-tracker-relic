"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { subMonths, startOfMonth, endOfMonth, format, eachMonthOfInterval } from "date-fns"

export async function getMonthlyTrendData() {
  const session = await auth()
  if (!session?.user?.companyId) {
    return { error: "Unauthorized" }
  }

  const companyId = session.user.companyId

  // Get last 12 months
  const endDate = new Date()
  const startDate = subMonths(startOfMonth(endDate), 11)

  const [incomes, expenditures] = await Promise.all([
    db.income.findMany({
      where: {
        companyId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        amount: true,
        date: true,
      },
    }),
    db.expenditure.findMany({
      where: {
        companyId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        amount: true,
        date: true,
      },
    }),
  ])

  // Generate all months in range
  const months = eachMonthOfInterval({ start: startDate, end: endDate })

  const monthlyData = months.map((month) => {
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)

    const monthIncome = incomes
      .filter((inc) => inc.date >= monthStart && inc.date <= monthEnd)
      .reduce((sum, inc) => sum + inc.amount, 0)

    const monthExpenses = expenditures
      .filter((exp) => exp.date >= monthStart && exp.date <= monthEnd)
      .reduce((sum, exp) => sum + exp.amount, 0)

    return {
      month: format(month, "MMM yy"),
      income: monthIncome,
      expenses: monthExpenses,
    }
  })

  return { success: true, data: monthlyData }
}

export async function getCashFlowData() {
  const session = await auth()
  if (!session?.user?.companyId) {
    return { error: "Unauthorized" }
  }

  const companyId = session.user.companyId

  // Get last 30 days of transactions
  const endDate = new Date()
  const startDate = subMonths(endDate, 1)

  const [incomes, expenditures, accounts] = await Promise.all([
    db.income.findMany({
      where: {
        companyId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        amount: true,
        date: true,
      },
      orderBy: {
        date: "asc",
      },
    }),
    db.expenditure.findMany({
      where: {
        companyId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        amount: true,
        date: true,
      },
      orderBy: {
        date: "asc",
      },
    }),
    db.account.findMany({
      where: { companyId },
      select: {
        balance: true,
      },
    }),
  ])

  // Get initial balance (30 days ago)
  const initialBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)

  // Get all income before start date
  const previousIncomes = await db.income.aggregate({
    where: {
      companyId,
      date: {
        lt: startDate,
      },
    },
    _sum: {
      amount: true,
    },
  })

  // Get all expenses before start date
  const previousExpenses = await db.expenditure.aggregate({
    where: {
      companyId,
      date: {
        lt: startDate,
      },
    },
    _sum: {
      amount: true,
    },
  })

  // Calculate starting balance
  let runningBalance = initialBalance -
    (previousIncomes._sum.amount || 0) +
    (previousExpenses._sum.amount || 0)

  // Combine and sort transactions
  const allTransactions = [
    ...incomes.map((inc) => ({
      date: format(inc.date, "yyyy-MM-dd"),
      income: inc.amount,
      expense: 0,
    })),
    ...expenditures.map((exp) => ({
      date: format(exp.date, "yyyy-MM-dd"),
      income: 0,
      expense: exp.amount,
    })),
  ].sort((a, b) => a.date.localeCompare(b.date))

  // Group by date and calculate cumulative balance
  const dailyData = new Map<string, { income: number; expense: number }>()

  allTransactions.forEach((txn) => {
    const existing = dailyData.get(txn.date) || { income: 0, expense: 0 }
    dailyData.set(txn.date, {
      income: existing.income + txn.income,
      expense: existing.expense + txn.expense,
    })
  })

  const cashFlowData = Array.from(dailyData.entries()).map(([date, data]) => {
    runningBalance = runningBalance + data.income - data.expense
    return {
      date,
      balance: runningBalance,
      income: data.income,
      expense: data.expense,
    }
  })

  return { success: true, data: cashFlowData }
}

export async function getCategoryBreakdown() {
  const session = await auth()
  if (!session?.user?.companyId) {
    return { error: "Unauthorized" }
  }

  const companyId = session.user.companyId

  // Get current month data
  const monthStart = startOfMonth(new Date())
  const monthEnd = endOfMonth(new Date())

  const expenditures = await db.expenditure.findMany({
    where: {
      companyId,
      date: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
    include: {
      category: true,
    },
  })

  // Group by category
  const categoryMap = new Map<string, { name: string; value: number; color?: string }>()

  expenditures.forEach((exp) => {
    const categoryName = exp.category?.name || "Uncategorized"
    const existing = categoryMap.get(categoryName) || { name: categoryName, value: 0, color: exp.category?.color || undefined }
    categoryMap.set(categoryName, {
      ...existing,
      value: existing.value + exp.amount,
    })
  })

  const data = Array.from(categoryMap.values()).sort((a, b) => b.value - a.value)

  return { success: true, data }
}
