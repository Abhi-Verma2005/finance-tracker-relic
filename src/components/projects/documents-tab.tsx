"use client"

import { useState } from "react"
import { LayoutGrid, ListFilter, List as ListIcon, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DocumentListView } from "@/components/projects/document-list-view"
import { DocumentGridView } from "@/components/projects/document-grid-view"
import { DocumentUploadDialog } from "@/components/projects/document-upload-dialog"
import type { ExtendedDocument } from "@/types/documents"
import { DocumentType } from "@prisma/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { DocumentListSkeleton, DocumentGridSkeleton } from "@/components/projects/skeletons"

interface DocumentsTabProps {
  projectId: string
  documents: ExtendedDocument[]
  userId?: string
}

export function DocumentsTab({ projectId, documents, userId }: DocumentsTabProps) {
  const router = useRouter()
  const [view, setView] = useState<"list" | "grid">("list")
  const [typeFilter, setTypeFilter] = useState<string>("ALL")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await router.refresh()
    setTimeout(() => {
        setIsRefreshing(false)
        toast.success("Documents refreshed")
    }, 500) // Minimum duration for visual feedback
  }

  const filteredDocuments = documents.filter((doc) => {
    if (typeFilter === "ALL") return true
    return doc.type === typeFilter
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border-b pb-6">
        <div className="flex items-center gap-3">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px] h-9 bg-background/50 border-input/50 shadow-sm transition-colors hover:bg-accent/50">
                    <ListFilter className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Filter type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    {Object.keys(DocumentType).map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg border border-border/50">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-7 w-7 rounded-sm transition-all ${view === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:bg-transparent"}`}
                    onClick={() => setView("list")}
                >
                    <ListIcon className="h-4 w-4" />
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-7 w-7 rounded-sm transition-all ${view === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:bg-transparent"}`}
                    onClick={() => setView("grid")}
                >
                    <LayoutGrid className="h-4 w-4" />
                </Button>
            </div>

            <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-input/50 shadow-sm bg-background/50 hover:bg-accent/50"
                onClick={handleRefresh}
                disabled={isRefreshing}
            >
                <RefreshCw className={`h-4 w-4 text-muted-foreground ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
        </div>

        <DocumentUploadDialog 
            projectId={projectId} 
            trigger={
                <Button className="h-9 shadow-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
                    Add Document
                </Button>
            }
        />
      </div>

      <div className="min-h-[400px]">
        {isRefreshing ? (
             view === "list" ? <DocumentListSkeleton /> : <DocumentGridSkeleton />
        ) : view === "list" ? (
            <DocumentListView documents={filteredDocuments} />
        ) : (
            <DocumentGridView documents={filteredDocuments} />
        )}
      </div>
    </div>
  )
}
