'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown, DollarSign, Wallet, Calendar, Plus, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IncomeDialog } from "@/components/incomes/income-dialog"
import { ExpenditureDialog } from "@/components/expenditures/expenditure-dialog"
import { cn } from "@/lib/utils"

interface Tag {
    id: string
    name: string
}

interface Income {
    id: string
    amount: number
    description: string
    date: Date
}

interface Expenditure {
    id: string
    amount: number
    description: string
    date: Date
    employee?: {
        name: string
    } | null
}

interface FinancesTabProps {
    tag?: Tag | null
    incomes: Income[]
    expenditures: Expenditure[]
    accounts: any[]
    tags: any[]
    employees: any[]
    categories: any[]
}

export function FinancesTab({ tag, incomes, expenditures, accounts, tags, employees, categories }: FinancesTabProps) {
    const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0)
    const totalExpenses = expenditures.reduce((sum, exp) => sum + exp.amount, 0)
    const netProfit = totalIncome - totalExpenses
    const margin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0

    // Combine and sort transactions
    const allTransactions = [
        ...incomes.map(inc => ({ ...inc, type: 'income' as const })),
        ...expenditures.map(exp => ({ ...exp, type: 'expense' as const }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount)
    }

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <div className="space-y-8">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-semibold tracking-tight">Financial Overview</h3>
                    <p className="text-sm text-muted-foreground">Track income, expenses, and profitability.</p>
                </div>
                <div className="flex gap-2">
                    <IncomeDialog 
                        accounts={accounts} 
                        tags={tags} 
                        categories={categories}
                        initialData={tag ? { tagIds: [tag.id] } : undefined}
                    >
                         <Button className="bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow transition-all">
                            <Plus className="mr-2 h-4 w-4" />
                            Log Income
                        </Button>
                    </IncomeDialog>
                    
                    <ExpenditureDialog 
                        accounts={accounts} 
                        tags={tags} 
                        employees={employees} 
                        categories={categories}
                        initialData={tag ? { tagIds: [tag.id] } : undefined}
                    >
                        <Button className="bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow transition-all">
                            <Plus className="mr-2 h-4 w-4" />
                            Log Expense
                        </Button>
                    </ExpenditureDialog>
                </div>
            </div>

            {/* Summary Cards with Apple-style blurring and clean typography */}
            <div className="grid gap-6 md:grid-cols-3">
                <SummaryCard 
                    title="Total Income" 
                    amount={totalIncome} 
                    formatCurrency={formatCurrency}
                    icon={ArrowUpCircle}
                    iconColor="text-green-500"
                    trend="Revenue generated"
                    trendColor="text-muted-foreground"
                />
                <SummaryCard 
                    title="Total Expenses" 
                    amount={totalExpenses} 
                    formatCurrency={formatCurrency}
                    icon={ArrowDownCircle}
                    iconColor="text-red-500"
                    trend="Costs incurred"
                    trendColor="text-muted-foreground"
                />
                <SummaryCard 
                    title="Net Profit" 
                    amount={netProfit} 
                    formatCurrency={formatCurrency}
                    icon={netProfit >= 0 ? TrendingUp : TrendingDown}
                    iconColor={netProfit >= 0 ? "text-green-500" : "text-red-500"}
                    trend={`${margin}% profit margin`}
                    trendColor={netProfit >= 0 ? "text-green-600" : "text-red-600"}
                    isMain
                />
            </div>

            {/* Transactions Section */}
            <div className="space-y-4">
                <Tabs defaultValue="transactions" className="w-full">
                    <div className="flex items-center justify-between mb-4">
                         <TabsList className="bg-muted/50 p-1 border border-border/50 backdrop-blur-sm">
                            <TabsTrigger value="transactions" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">All Transactions</TabsTrigger>
                            <TabsTrigger value="income" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Income</TabsTrigger>
                            <TabsTrigger value="expenses" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Expenses</TabsTrigger>
                        </TabsList>
                        
                        {/* Optional filters could go here */}
                         {/* <Button variant="outline" size="sm" className="h-8 gap-2 border-dashed">
                             <Filter className="h-3.5 w-3.5" />
                             Filter
                         </Button> */}
                    </div>
                    
                    <TabsContent value="transactions" className="mt-0">
                         <TransactionCard>
                            <TransactionTable transactions={allTransactions} formatCurrency={formatCurrency} formatDate={formatDate} />
                         </TransactionCard>
                    </TabsContent>
                    
                    <TabsContent value="income" className="mt-0">
                         <TransactionCard>
                             <TransactionTable 
                                transactions={allTransactions.filter(t => t.type === 'income')} 
                                formatCurrency={formatCurrency} 
                                formatDate={formatDate}
                            />
                         </TransactionCard>
                    </TabsContent>

                    <TabsContent value="expenses" className="mt-0">
                        <TransactionCard>
                            <TransactionTable 
                                transactions={allTransactions.filter(t => t.type === 'expense')} 
                                formatCurrency={formatCurrency} 
                                formatDate={formatDate}
                            />
                        </TransactionCard>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

function SummaryCard({ title, amount, formatCurrency, icon: Icon, iconColor, trend, trendColor, isMain }: any) {
    return (
        <Card className={cn(
            "relative overflow-hidden transition-all duration-200 hover:shadow-md border-border/50",
            isMain ? "bg-gradient-to-br from-background to-muted/20" : "bg-card"
        )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className={cn("p-2 rounded-full bg-background shadow-sm border border-border/50", iconColor)}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className={cn("text-2xl font-bold tracking-tight", iconColor.replace("text-", "text-opacity-90 "))}>
                    {formatCurrency(amount)}
                </div>
                <p className={cn("text-xs mt-1 font-medium", trendColor)}>
                    {trend}
                </p>
                {/* Decoration */}
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 blur-3xl" />
            </CardContent>
        </Card>
    )
}

function TransactionCard({ children }: { children: React.ReactNode }) {
    return (
        <Card className="border shadow-sm overflow-hidden bg-white/50 backdrop-blur-xl">
             <CardHeader className="pb-2 border-b border-border/40 bg-muted/20">
                 <div className="flex items-center gap-2">
                     <Wallet className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                 </div>
            </CardHeader>
            <CardContent className="p-0">
                {children}
            </CardContent>
        </Card>
    )
}

function TransactionTable({ 
    transactions, 
    formatCurrency, 
    formatDate 
}: { 
    transactions: any[], 
    formatCurrency: (val: number) => string,
    formatDate: (date: Date) => string
}) {
    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <div className="bg-muted p-4 rounded-full mb-4">
                     <Wallet className="h-8 w-8 opacity-40" />
                </div>
                <p className="font-medium">No transactions found</p>
                <p className="text-sm opacity-70">Start by logging an income or expense.</p>
            </div>
        )
    }

    return (
        <Table>
            <TableHeader className="bg-muted/20">
                <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[150px]">Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {transactions.map((t) => (
                    <TableRow key={t.id} className="group hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium text-muted-foreground text-xs">
                             <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5 opacity-70" />
                                {formatDate(t.date)}
                             </div>
                        </TableCell>
                        <TableCell className="font-medium">{t.description}</TableCell>
                        <TableCell>
                            <Badge variant="outline" className={cn(
                                "border-0 font-normal",
                                t.type === 'income' ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-red-50 text-red-700 hover:bg-red-100"
                            )}>
                                {t.type === 'income' ? 'Income' : 'Expense'}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                            {t.type === 'expense' && t.employee ? (
                                <div className="flex items-center gap-1.5">
                                    <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] border">
                                        {t.employee.name[0]}
                                    </div>
                                    <span className="text-xs">{t.employee.name}</span>
                                </div>
                            ) : '-'}
                        </TableCell>
                        <TableCell className={`text-right font-medium`}>
                            <span className={t.type === 'income' ? 'text-green-600' : 'text-red-500'}>
                                 {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                            </span>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
