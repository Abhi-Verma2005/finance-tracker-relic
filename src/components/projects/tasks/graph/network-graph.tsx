"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import * as d3 from "d3"
import { useTheme } from "next-themes"
import { Badge } from "@/components/ui/badge"
import { ZoomIn, ZoomOut, Maximize } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NetworkGraphProps {
  modules: any[]
  employees: any[]
  onTaskClick?: (task: any) => void
}

export function NetworkGraph({ modules, employees, onTaskClick }: NetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const [hoveredNode, setHoveredNode] = useState<any>(null)

  // Transform data into nodes and links
  const data = useMemo(() => {
    const nodes: any[] = []
    const links: any[] = []

    // 1. Stories (Modules) - Level 1
    modules.forEach(mod => {
        nodes.push({ id: `story-${mod.id}`, type: "story", name: mod.name, data: mod, r: 25 })
        
        // 2. Tasks - Level 2
        mod.tasks.forEach((task: any) => {
            nodes.push({ 
                id: `task-${task.id}`, 
                type: "task", 
                name: task.title, 
                status: task.status,
                data: task, 
                r: 15 
            })
            links.push({ source: `story-${mod.id}`, target: `task-${task.id}`, type: "story-task" })

            // 3. Assignees (People) - Level 3
            task.assignees.forEach((assignee: any) => {
                const empId = `emp-${assignee.employeeId}`
                // Check if employee node exists already
                if (!nodes.find(n => n.id === empId)) {
                    nodes.push({ 
                        id: empId, 
                        type: "person", 
                        name: assignee.employee.name, 
                        label: assignee.employee.name.charAt(0),
                        r: 10 
                    })
                }
                links.push({ source: `task-${task.id}`, target: empId, type: "task-person" })
            })
        })
    })

    return { nodes, links }
  }, [modules])

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.nodes.length === 0) return

    const container = containerRef.current
    let width = container.clientWidth
    let height = container.clientHeight

    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove()

    const svg = d3.select(svgRef.current)
        .attr("viewBox", [0, 0, width, height])
        
    // Zoom Group
    const g = svg.append("g")

    // Zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => {
            g.attr("transform", event.transform)
        })

    svg.call(zoom as any)

    // Initial positioning simulation
    const simulation = d3.forceSimulation(data.nodes)
        .force("link", d3.forceLink(data.links).id((d: any) => d.id).distance(80))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide().radius((d: any) => d.r + 5))

    // Arrow marker
    svg.append("defs").selectAll("marker")
        .data(["end"])
        .join("marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 25)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("fill", "#999")
        .attr("d", "M0,-5L10,0L0,5")

    const link = g.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.3)
        .selectAll("line")
        .data(data.links)
        .join("line")
        .attr("stroke-width", 1.5)

    const node = g.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("g")
        .data(data.nodes)
        .join("g")
        .attr("cursor", "pointer")
        .call(drag(simulation) as any)
        .on("click", (event, d: any) => {
            if (d.type === "task" && onTaskClick) {
                onTaskClick(d.data)
            }
        })
        .on("mouseover", (event, d) => setHoveredNode(d))
        .on("mouseout", () => setHoveredNode(null))

    // Circles
    node.append("circle")
        .attr("r", (d: any) => d.r)
        .attr("fill", (d: any) => {
            if (d.type === "story") return "#0f172a" 
            if (d.type === "person") return "#64748b" 
            if (d.status === "COMPLETED") return "#22c55e"
            if (d.status === "IN_PROGRESS") return "#3b82f6"
            if (d.status === "IN_REVIEW") return "#a855f7"
            if (d.status === "TODO") return "#94a3b8" 
            return "#cbd5e1"
        })

    // Labels
    node.append("text")
        .attr("dy", (d: any) => d.type === "person" ? "0.35em" : -d.r - 5)
        .attr("text-anchor", "middle")
        .text((d: any) => d.type === "person" ? d.label : d.type === "story" ? d.name : "")
        .attr("fill", d => d.type === "person" ? "white" : "currentColor")
        .attr("stroke", "none")
        .attr("font-size", (d: any) => d.type === "person" ? "10px" : "12px")
        .attr("font-weight", "bold")
        .attr("pointer-events", "none")

    simulation.on("tick", () => {
        link
            .attr("x1", (d: any) => d.source.x)
            .attr("y1", (d: any) => d.source.y)
            .attr("x2", (d: any) => d.target.x)
            .attr("y2", (d: any) => d.target.y)

        node
            .attr("transform", (d: any) => `translate(${d.x},${d.y})`)
    })

    function drag(simulation: any) {
        function dragstarted(event: any) {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            event.subject.fx = event.subject.x
            event.subject.fy = event.subject.y
        }

        function dragged(event: any) {
            event.subject.fx = event.x
            event.subject.fy = event.y
        }

        function dragended(event: any) {
            if (!event.active) simulation.alphaTarget(0)
            event.subject.fx = null
            event.subject.fy = null
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
    }

    // Resize Observer to center graph
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            const { width, height } = entry.contentRect
            svg.attr("viewBox", [0, 0, width, height])
            simulation.force("center", d3.forceCenter(width / 2, height / 2))
            simulation.alpha(0.3).restart()
        }
    })
    
    resizeObserver.observe(container)

    return () => {
        simulation.stop()
        resizeObserver.disconnect()
    }
  }, [data, onTaskClick])

  return (
    <div className="relative w-full h-full bg-muted/5 rounded-lg border overflow-hidden" ref={containerRef}>
        <svg ref={svgRef} className="w-full h-full" />
        
        {/* Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button variant="secondary" size="icon" className="h-8 w-8 shadow-sm" onClick={() => {
                const svg = d3.select(svgRef.current)
                svg.transition().duration(750).call(d3.zoom().transform as any, d3.zoomIdentity)
            }}>
                <Maximize className="h-4 w-4" />
            </Button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur p-2 rounded-md border text-xs space-y-1 shadow-sm pointer-events-none select-none">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-900" /> Story</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /> In Progress</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500" /> In Review</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /> Completed</div>
        </div>

        {/* Tooltip Card (Custom Overlay) */}
        {hoveredNode && hoveredNode.type === "task" && (
             <div 
                className="absolute p-3 rounded-lg shadow-lg border bg-background z-10 w-48 pointer-events-none"
                style={{
                     left: "50%",
                     top: "20px", 
                     transform: "translateX(-50%)"
                }}
             >
                <div className="font-semibold text-sm leading-tight mb-1">{hoveredNode.name}</div>
                <Badge variant="secondary" className="text-[10px] h-5">{hoveredNode.status}</Badge>
             </div>
        )}
    </div>
  )
}
