"use client"

import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import { TrendingUp, TrendingDown } from "lucide-react"
import { IncomeActions } from "@/components/incomes/income-actions"
import { ExpenditureActions } from "@/components/expenditures/expenditure-actions"

export type TransactionType = "INCOME" | "EXPENSE"

export interface Transaction {
  id: string
  type: TransactionType
  date: Date
  description: string
  amount: number
  accountId: string
  account: {
    name: string
  }
  employee?: {
    id: string
    name: string
    role?: string | null
  } | null
  category?: {
    id: string
    name: string
    icon?: string | null
    color?: string | null
  } | null
  tags: Array<{
    tag: {
      id: string
      name: string
    }
  }>
}

interface TransactionRowProps {
  transaction: Transaction
  accounts?: any[]
  tags?: any[]
  categories?: any[]
  employees?: any[]
}

export function TransactionRow({ transaction, accounts = [], tags = [], categories = [], employees = [] }: TransactionRowProps) {
  const isIncome = transaction.type === "INCOME"
  const amountColor = isIncome ? "text-green-500" : "text-red-500"
  const badgeVariant = isIncome ? "default" : "destructive"
  const Icon = isIncome ? TrendingUp : TrendingDown
  const amountPrefix = isIncome ? "+" : "-"

  return (
    <TableRow>
      <TableCell>{format(transaction.date, "PPP")}</TableCell>
      <TableCell className="font-medium">{transaction.description}</TableCell>
      <TableCell>
        {transaction.employee ? (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{transaction.employee.name}</span>
            {transaction.employee.role && (
              <span className="text-xs text-muted-foreground">{transaction.employee.role}</span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        {transaction.category ? (
          <Badge
            variant="secondary"
            style={{
              backgroundColor: transaction.category.color ? `${transaction.category.color}20` : undefined,
              color: transaction.category.color || undefined,
              borderColor: transaction.category.color || undefined,
            }}
            className="border"
          >
            {transaction.category.name}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>{transaction.account.name}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Badge variant={badgeVariant} className="w-fit">
            <Icon className="mr-1 h-3 w-3" />
            {transaction.type}
          </Badge>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {transaction.tags.map(({ tag }) => (
            <Badge key={tag.id} variant="secondary">
              {tag.name}
            </Badge>
          ))}
        </div>
      </TableCell>
      <TableCell className={`font-bold ${amountColor}`}>
        {amountPrefix}${transaction.amount.toFixed(2)}
      </TableCell>
      <TableCell>
        {isIncome ? (
          <IncomeActions 
            transaction={transaction} 
            accounts={accounts} 
            tags={tags} 
            categories={categories} 
          />
        ) : (
          <ExpenditureActions 
            transaction={transaction} 
            accounts={accounts} 
            tags={tags} 
            categories={categories}
            employees={employees}
          />
        )}
      </TableCell>
    </TableRow>
  )
}
