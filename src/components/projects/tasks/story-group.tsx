"use client"

import { useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { ChevronRight, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { TaskItem } from "./task-item"
import { CreateTaskDialog } from "./create-task-dialog"
import { TaskSheet } from "./task-sheet"
import { deleteModule } from "@/actions/modules"
import { toast } from "sonner"

interface StoryGroupProps {
  module: any // Ideally typed
  projectId: string
  employees: any[]
}

export function StoryGroup({ module, projectId, employees }: StoryGroupProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if(!confirm(`Delete story "${module.name}" and all its tasks?`)) return
    
    const result = await deleteModule(module.id)
    if (result.success) toast.success("Story deleted")
    else toast.error("Failed to delete story")
  }

  // Calculate stats
  const totalTasks = module.tasks.length
  const completedTasks = module.tasks.filter((t: any) => t.status === "COMPLETED").length
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

  return (
    <>
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="space-y-2"
      >
        <div 
            className="flex items-center justify-between group py-2"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex items-center gap-2 flex-1 min-w-0">
            <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1 h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground">
                <ChevronRight className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-90")} />
                </Button>
            </CollapsibleTrigger>
            
            <h3 className="font-semibold text-lg tracking-tight text-foreground/90 truncate">
                {module.name}
            </h3>
            
            <span className="text-xs text-muted-foreground font-medium ml-2 px-2 py-0.5 rounded-full bg-muted/50">
                {completedTasks}/{totalTasks}
            </span>
            
            {totalTasks > 0 && (
                <div className="h-1.5 w-24 bg-secondary rounded-full overflow-hidden ml-2 hidden sm:block">
                    <div 
                        className="h-full bg-primary/80 transition-all duration-500 ease-out" 
                        style={{ width: `${progress}%` }} 
                    />
                </div>
            )}
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <CreateTaskDialog 
                    projectId={projectId} 
                    moduleId={module.id} 
                    employees={employees}
                />
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={handleDelete}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>

        <CollapsibleContent className="space-y-1 pl-2 md:pl-4 border-l-2 border-border/30 ml-3">
            {module.tasks.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground border border-dashed rounded-lg bg-muted/20">
                    No tasks yet. <br />
                    <span className="text-xs opacity-70">Add a task to get started.</span>
                </div>
            ) : (
                <div className="grid gap-2">
                    {/* Active Tasks (Sorted by Updated, Recent first) */}
                    {module.tasks
                        .filter((t: any) => t.status !== "COMPLETED")
                        // Sort: In Progress first, then by date desc
                        .sort((a: any, b: any) => {
                            if (a.status === "IN_PROGRESS" && b.status !== "IN_PROGRESS") return -1
                            if (a.status !== "IN_PROGRESS" && b.status === "IN_PROGRESS") return 1
                            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                        })
                        .map((task: any) => (
                        <TaskItem 
                            key={task.id} 
                            task={task} 
                            onClick={() => setSelectedTask(task)}
                        />
                    ))}

                    {/* Completed Tasks (Past Tasks) */}
                    {module.tasks.some((t: any) => t.status === "COMPLETED") && (
                        <Collapsible className="mt-4">
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 gap-2 text-muted-foreground w-full justify-start hover:bg-muted/50">
                                    <span className="text-xs font-medium uppercase tracking-wider">Past Tasks ({module.tasks.filter((t: any) => t.status === "COMPLETED").length})</span>
                                    <ChevronRight className="h-3 w-3 transition-transform duration-200 ui-expanded:rotate-90" />
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-2 mt-2 pt-2 border-t border-border/30">
                                {module.tasks
                                    .filter((t: any) => t.status === "COMPLETED")
                                    .sort((a: any, b: any) => new Date(b.completedAt || b.updatedAt).getTime() - new Date(a.completedAt || a.updatedAt).getTime())
                                    .map((task: any) => (
                                    <div key={task.id} className="opacity-60 hover:opacity-100 transition-opacity">
                                        <TaskItem 
                                            task={task} 
                                            onClick={() => setSelectedTask(task)}
                                        />
                                    </div>
                                ))}
                            </CollapsibleContent>
                        </Collapsible>
                    )}
                </div>
            )}
        </CollapsibleContent>
      </Collapsible>

      <TaskSheet 
        task={selectedTask} 
        isOpen={!!selectedTask} 
        onClose={() => setSelectedTask(null)}
        onUpdate={(updated) => console.log("Update", updated)}
        employees={employees}
      />
    </>
  )
}
