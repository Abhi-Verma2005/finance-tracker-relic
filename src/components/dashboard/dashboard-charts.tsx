"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MonthlyTrendChart } from "@/components/charts/monthly-trend-chart"
import { CategoryDonutChart } from "@/components/charts/category-donut-chart"
import { CashFlowChart } from "@/components/charts/cash-flow-chart"
import { getMonthlyTrendData, getCashFlowData, getCategoryBreakdown } from "@/actions/dashboard"

export function DashboardCharts() {
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [cashFlowData, setCashFlowData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [monthly, cashFlow, category] = await Promise.all([
        getMonthlyTrendData(),
        getCashFlowData(),
        getCategoryBreakdown(),
      ])

      if (monthly.success) setMonthlyData(monthly.data)
      if (cashFlow.success) setCashFlowData(cashFlow.data)
      if (category.success) setCategoryData(category.data)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardContent className="pt-6">
            <div className="flex h-[350px] items-center justify-center text-muted-foreground">
              Loading charts...
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardContent className="pt-6">
            <div className="flex h-[350px] items-center justify-center text-muted-foreground">
              Loading...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Monthly Trend */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Income vs Expenses Trend</CardTitle>
          <CardDescription>
            Monthly comparison over the past 12 months
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          {monthlyData.length > 0 ? (
            <MonthlyTrendChart data={monthlyData} />
          ) : (
            <div className="flex h-[350px] items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>
              Current month spending by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <CategoryDonutChart data={categoryData} title="Total Spent" />
            ) : (
              <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                No expenses this month
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cash Flow */}
        <Card>
          <CardHeader>
            <CardTitle>Cash Flow Timeline</CardTitle>
            <CardDescription>
              Daily balance changes over the past 30 days
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {cashFlowData.length > 0 ? (
              <CashFlowChart data={cashFlowData} />
            ) : (
              <div className="flex h-[350px] items-center justify-center text-muted-foreground">
                No transactions in the past 30 days
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
