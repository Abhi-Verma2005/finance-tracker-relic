"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

interface CashFlowData {
  date: string
  balance: number
  income: number
  expense: number
}

interface CashFlowChartProps {
  data: CashFlowData[]
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove()

    // Get container dimensions
    const containerWidth = containerRef.current.offsetWidth
    const margin = { top: 20, right: 60, bottom: 50, left: 60 }
    const width = containerWidth - margin.left - margin.right
    const height = 350 - margin.top - margin.bottom

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", containerWidth)
      .attr("height", 350)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Parse dates
    const parseDate = d3.timeParse("%Y-%m-%d")
    const dataWithDates = data.map(d => ({
      ...d,
      parsedDate: parseDate(d.date) || new Date()
    }))

    // Create scales
    const x = d3
      .scaleTime()
      .domain(d3.extent(dataWithDates, d => d.parsedDate) as [Date, Date])
      .range([0, width])

    const maxBalance = d3.max(dataWithDates, d => d.balance) || 0
    const minBalance = d3.min(dataWithDates, d => d.balance) || 0
    const padding = (maxBalance - minBalance) * 0.1

    const y = d3
      .scaleLinear()
      .domain([minBalance - padding, maxBalance + padding])
      .range([height, 0])

    // Add gradient for area
    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "area-gradient")
      .attr("x1", "0%")
      .attr("x2", "0%")
      .attr("y1", "0%")
      .attr("y2", "100%")

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "rgb(59 130 246)")
      .attr("stop-opacity", 0.4)

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "rgb(59 130 246)")
      .attr("stop-opacity", 0.05)

    // Create area generator
    const area = d3
      .area<typeof dataWithDates[0]>()
      .x(d => x(d.parsedDate))
      .y0(height)
      .y1(d => y(d.balance))
      .curve(d3.curveMonotoneX)

    // Create line generator
    const line = d3
      .line<typeof dataWithDates[0]>()
      .x(d => x(d.parsedDate))
      .y(d => y(d.balance))
      .curve(d3.curveMonotoneX)

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

    // Add area
    svg
      .append("path")
      .datum(dataWithDates)
      .attr("fill", "url(#area-gradient)")
      .attr("d", area)

    // Add line
    svg
      .append("path")
      .datum(dataWithDates)
      .attr("fill", "none")
      .attr("stroke", "rgb(59 130 246)")
      .attr("stroke-width", 3)
      .attr("d", line)

    // Add X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat((d) => d3.timeFormat("%b %d")(d as Date)))
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
        d3.axisLeft(y).tickFormat(d => `$${d3.format(".2s")(d as number)}`)
      )
      .selectAll("text")
      .attr("class", "fill-muted-foreground text-xs")

    // Add dots
    svg
      .selectAll(".dot")
      .data(dataWithDates)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.parsedDate))
      .attr("cy", d => y(d.balance))
      .attr("r", 4)
      .attr("fill", "rgb(59 130 246)")
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseenter", function(event, d) {
        d3.select(this).transition().duration(200).attr("r", 6)

        // Create tooltip group
        const tooltipGroup = svg
          .append("g")
          .attr("class", "tooltip-group")
          .attr("transform", `translate(${x(d.parsedDate)},${y(d.balance) - 80})`)

        // Tooltip background
        tooltipGroup
          .append("rect")
          .attr("x", -75)
          .attr("y", 0)
          .attr("width", 150)
          .attr("height", 70)
          .attr("fill", "rgb(31 41 55)")
          .attr("rx", 6)
          .attr("stroke", "rgb(59 130 246)")
          .attr("stroke-width", 2)

        // Date
        tooltipGroup
          .append("text")
          .attr("x", 0)
          .attr("y", 18)
          .attr("text-anchor", "middle")
          .attr("fill", "white")
          .attr("font-size", "11px")
          .text(d3.timeFormat("%b %d, %Y")(d.parsedDate))

        // Balance
        tooltipGroup
          .append("text")
          .attr("x", 0)
          .attr("y", 36)
          .attr("text-anchor", "middle")
          .attr("fill", "rgb(59 130 246)")
          .attr("font-size", "14px")
          .attr("font-weight", "bold")
          .text(`$${d.balance.toLocaleString()}`)

        // Income/Expense
        tooltipGroup
          .append("text")
          .attr("x", 0)
          .attr("y", 52)
          .attr("text-anchor", "middle")
          .attr("fill", "rgb(34 197 94)")
          .attr("font-size", "10px")
          .text(`↑ $${d.income.toLocaleString()}`)

        tooltipGroup
          .append("text")
          .attr("x", 0)
          .attr("y", 64)
          .attr("text-anchor", "middle")
          .attr("fill", "rgb(239 68 68)")
          .attr("font-size", "10px")
          .text(`↓ $${d.expense.toLocaleString()}`)
      })
      .on("mouseleave", function() {
        d3.select(this).transition().duration(200).attr("r", 4)
        svg.selectAll(".tooltip-group").remove()
      })

    // Add zero line if needed
    if (minBalance < 0) {
      svg
        .append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", y(0))
        .attr("y2", y(0))
        .attr("stroke", "rgb(239 68 68)")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4")
        .attr("opacity", 0.5)
    }

  }, [data])

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
    </div>
  )
}
