import { Skeleton } from "@/components/ui/skeleton"

export function DocumentListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-3 w-[150px]" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      ))}
    </div>
  )
}

export function DocumentGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="aspect-square border rounded-lg p-4 flex flex-col justify-between">
          <Skeleton className="h-20 w-full rounded-md" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  )
}

export function KanbanSkeleton() {
  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {[1, 2, 3, 4].map((col) => (
        <div key={col} className="w-[300px] shrink-0 space-y-4">
          <div className="flex items-center justify-between">
             <Skeleton className="h-6 w-24" />
             <Skeleton className="h-6 w-8 rounded-full" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((card) => (
               <Skeleton key={card} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function TaskListSkeleton() {
  return (
    <div className="space-y-6">
       {[1, 2].map((group) => (
          <div key={group} className="space-y-4">
             <Skeleton className="h-8 w-1/3" />
             <div className="space-y-2 pl-4 border-l-2 border-muted">
                {[1, 2, 3].map((task) => (
                   <Skeleton key={task} className="h-16 w-full rounded-lg" />
                ))}
             </div>
          </div>
       ))}
    </div>
  )
}

export function GraphSkeleton() {
  return (
    <div className="w-full h-full min-h-[500px] border rounded-lg bg-muted/5 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
             <div className="relative w-full h-full">
                 {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton 
                        key={i} 
                        className="absolute rounded-full"
                        style={{
                            width: Math.random() * 40 + 20 + 'px',
                            height: Math.random() * 40 + 20 + 'px',
                            top: Math.random() * 80 + 10 + '%',
                            left: Math.random() * 80 + 10 + '%',
                        }} 
                    />
                 ))}
             </div>
        </div>
    </div>
  )
}

export function CommentSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
            ))}
        </div>
    )
}
