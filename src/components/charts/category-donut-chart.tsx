"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

interface CategoryData {
  name: string
  value: number
  color?: string
}

interface CategoryDonutChartProps {
  data: CategoryData[]
  title?: string
}

export function CategoryDonutChart({ data, title }: CategoryDonutChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove()

    // Get container dimensions
    const containerWidth = containerRef.current.offsetWidth
    const width = Math.min(containerWidth, 400)
    const height = 400
    const radius = Math.min(width, height) / 2 - 40

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`)

    // Create color scale
    const color = d3.scaleOrdinal<string>()
      .domain(data.map(d => d.name))
      .range(data.map(d => d.color || d3.schemeSet3[data.indexOf(d) % 12]))

    // Create pie
    const pie = d3.pie<CategoryData>()
      .value(d => d.value)
      .sort(null)

    // Create arc
    const arc = d3.arc<d3.PieArcDatum<CategoryData>>()
      .innerRadius(radius * 0.6)
      .outerRadius(radius)

    const arcHover = d3.arc<d3.PieArcDatum<CategoryData>>()
      .innerRadius(radius * 0.6)
      .outerRadius(radius * 1.05)

    // Create arcs
    const arcs = svg
      .selectAll("arc")
      .data(pie(data))
      .enter()
      .append("g")
      .attr("class", "arc")

    // Add paths
    arcs
      .append("path")
      .attr("d", arc)
      .attr("fill", d => color(d.data.name))
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseenter", function(event, d) {
        d3.select<SVGPathElement, d3.PieArcDatum<CategoryData>>(this)
          .transition()
          .duration(200)
          .attr("d", arcHover)

        // Show tooltip
        const total = d3.sum(data, d => d.value)
        const percentage = ((d.data.value / total) * 100).toFixed(1)

        svg
          .append("text")
          .attr("class", "tooltip-text")
          .attr("text-anchor", "middle")
          .attr("y", -10)
          .attr("font-size", "16px")
          .attr("font-weight", "bold")
          .text(d.data.name)

        svg
          .append("text")
          .attr("class", "tooltip-text")
          .attr("text-anchor", "middle")
          .attr("y", 15)
          .attr("font-size", "14px")
          .text(`$${d.data.value.toLocaleString()}`)

        svg
          .append("text")
          .attr("class", "tooltip-text")
          .attr("text-anchor", "middle")
          .attr("y", 35)
          .attr("font-size", "12px")
          .attr("fill", "#888")
          .text(`${percentage}%`)
      })
      .on("mouseleave", function() {
        d3.select<SVGPathElement, d3.PieArcDatum<CategoryData>>(this)
          .transition()
          .duration(200)
          .attr("d", arc)

        svg.selectAll(".tooltip-text").remove()
      })

    // Add center text
    const total = d3.sum(data, d => d.value)

    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("y", -5)
      .attr("font-size", "14px")
      .attr("fill", "#888")
      .text(title || "Total")

    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("y", 15)
      .attr("font-size", "20px")
      .attr("font-weight", "bold")
      .text(`$${total.toLocaleString()}`)

    // Add legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(${radius + 20}, ${-radius})`)

    const legendItems = legend
      .selectAll(".legend-item")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 25})`)

    legendItems
      .append("rect")
      .attr("width", 16)
      .attr("height", 16)
      .attr("fill", d => color(d.name))
      .attr("rx", 3)

    legendItems
      .append("text")
      .attr("x", 24)
      .attr("y", 12)
      .attr("font-size", "12px")
      .text(d => {
        const name = d.name.length > 15 ? d.name.substring(0, 15) + "..." : d.name
        return name
      })

  }, [data, title])

  return (
    <div ref={containerRef} className="w-full flex justify-center">
      <svg ref={svgRef} />
    </div>
  )
}
