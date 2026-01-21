"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

interface MonthlyData {
  month: string
  income: number
  expenses: number
}

interface MonthlyTrendChartProps {
  data: MonthlyData[]
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove()

    // Get container dimensions
    const containerWidth = containerRef.current.offsetWidth
    const margin = { top: 20, right: 80, bottom: 50, left: 60 }
    const width = containerWidth - margin.left - margin.right
    const height = 350 - margin.top - margin.bottom

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", containerWidth)
      .attr("height", 350)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Create scales
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.month))
      .range([0, width])
      .padding(0.1)

    const maxValue = d3.max(data, (d) => Math.max(d.income, d.expenses)) || 0
    const y = d3.scaleLinear().domain([0, maxValue * 1.1]).range([height, 0])

    // Add grid lines
    svg
      .append("g")
      .attr("class", "grid")
      .attr("opacity", 0.1)
      .call(
        d3
          .axisLeft(y)
          .tickSize(-width)
          .tickFormat(() => "")
      )

    // Add X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("class", "fill-muted-foreground text-xs")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)")

    // Add Y axis
    svg
      .append("g")
      .call(
        d3.axisLeft(y).tickFormat((d) => `$${d3.format(".2s")(d as number)}`)
      )
      .selectAll("text")
      .attr("class", "fill-muted-foreground text-xs")

    // Create line generators
    const incomeLine = d3
      .line<MonthlyData>()
      .x((d) => (x(d.month) || 0) + x.bandwidth() / 2)
      .y((d) => y(d.income))
      .curve(d3.curveMonotoneX)

    const expenseLine = d3
      .line<MonthlyData>()
      .x((d) => (x(d.month) || 0) + x.bandwidth() / 2)
      .y((d) => y(d.expenses))
      .curve(d3.curveMonotoneX)

    // Add income line
    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "rgb(34 197 94)")
      .attr("stroke-width", 3)
      .attr("d", incomeLine)

    // Add expense line
    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "rgb(239 68 68)")
      .attr("stroke-width", 3)
      .attr("d", expenseLine)

    // Add income dots
    svg
      .selectAll(".income-dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "income-dot")
      .attr("cx", (d) => (x(d.month) || 0) + x.bandwidth() / 2)
      .attr("cy", (d) => y(d.income))
      .attr("r", 5)
      .attr("fill", "rgb(34 197 94)")
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseenter", function (event, d) {
        d3.select(this).transition().duration(200).attr("r", 7)

        // Show tooltip
        const tooltip = svg
          .append("g")
          .attr("class", "tooltip")
          .attr("transform", `translate(${(x(d.month) || 0) + x.bandwidth() / 2},${y(d.income) - 10})`)

        tooltip
          .append("rect")
          .attr("x", -50)
          .attr("y", -30)
          .attr("width", 100)
          .attr("height", 25)
          .attr("fill", "rgb(34 197 94)")
          .attr("rx", 4)

        tooltip
          .append("text")
          .attr("text-anchor", "middle")
          .attr("y", -12)
          .attr("fill", "white")
          .attr("font-size", "12px")
          .text(`$${d.income.toLocaleString()}`)
      })
      .on("mouseleave", function () {
        d3.select(this).transition().duration(200).attr("r", 5)
        svg.selectAll(".tooltip").remove()
      })

    // Add expense dots
    svg
      .selectAll(".expense-dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "expense-dot")
      .attr("cx", (d) => (x(d.month) || 0) + x.bandwidth() / 2)
      .attr("cy", (d) => y(d.expenses))
      .attr("r", 5)
      .attr("fill", "rgb(239 68 68)")
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseenter", function (event, d) {
        d3.select(this).transition().duration(200).attr("r", 7)

        // Show tooltip
        const tooltip = svg
          .append("g")
          .attr("class", "tooltip")
          .attr("transform", `translate(${(x(d.month) || 0) + x.bandwidth() / 2},${y(d.expenses) - 10})`)

        tooltip
          .append("rect")
          .attr("x", -50)
          .attr("y", -30)
          .attr("width", 100)
          .attr("height", 25)
          .attr("fill", "rgb(239 68 68)")
          .attr("rx", 4)

        tooltip
          .append("text")
          .attr("text-anchor", "middle")
          .attr("y", -12)
          .attr("fill", "white")
          .attr("font-size", "12px")
          .text(`$${d.expenses.toLocaleString()}`)
      })
      .on("mouseleave", function () {
        d3.select(this).transition().duration(200).attr("r", 5)
        svg.selectAll(".tooltip").remove()
      })

    // Add legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - 100}, 0)`)

    legend
      .append("line")
      .attr("x1", 0)
      .attr("x2", 30)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", "rgb(34 197 94)")
      .attr("stroke-width", 3)

    legend
      .append("text")
      .attr("x", 35)
      .attr("y", 5)
      .attr("class", "fill-muted-foreground text-xs")
      .text("Income")

    legend
      .append("line")
      .attr("x1", 0)
      .attr("x2", 30)
      .attr("y1", 20)
      .attr("y2", 20)
      .attr("stroke", "rgb(239 68 68)")
      .attr("stroke-width", 3)

    legend
      .append("text")
      .attr("x", 35)
      .attr("y", 25)
      .attr("class", "fill-muted-foreground text-xs")
      .text("Expenses")

  }, [data])

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
    </div>
  )
}
