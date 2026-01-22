'use client'

import { Card } from "@/components/ui/card"
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react"

export function FinancesTab({ tag, incomes, expenditures }: any) {
    const totalIncome = incomes.reduce((sum: number, inc: any) => sum + inc.amount, 0)
    const totalExpenses = expenditures.reduce((sum: number, exp: any) => sum + exp.amount, 0)
    const netProfit = totalIncome - totalExpenses
    const margin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="p-4">
                    <div className="text-sm font-medium text-muted-foreground">Total Income</div>
                    <div className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm font-medium text-muted-foreground">Total Expenses</div>
                    <div className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm font-medium text-muted-foreground">Net Profit</div>
                    <div className="text-2xl font-bold">${netProfit.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">{margin}% margin</div>
                </Card>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-3">Income</h3>
                {incomes.length === 0 ? (
                    <Card className="p-6 text-center text-muted-foreground">No income recorded</Card>
                ) : (
                    <div className="space-y-2">
                        {incomes.map((income: any) => (
                            <Card key={income.id} className="p-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <ArrowUpCircle className="h-5 w-5 text-green-600" />
                                    <div>
                                        <div className="font-medium">{income.description}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(income.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-green-600 font-semibold">+${income.amount.toFixed(2)}</div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-3">Expenses</h3>
                {expenditures.length === 0 ? (
                    <Card className="p-6 text-center text-muted-foreground">No expenses recorded</Card>
                ) : (
                    <div className="space-y-2">
                        {expenditures.map((exp: any) => (
                            <Card key={exp.id} className="p-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <ArrowDownCircle className="h-5 w-5 text-red-600" />
                                    <div>
                                        <div className="font-medium">{exp.description}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(exp.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-red-600 font-semibold">-${exp.amount.toFixed(2)}</div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
