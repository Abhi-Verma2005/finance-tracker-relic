"use client"

import { useState, useEffect, useCallback } from "react"
import { Document } from "@prisma/client"
import { getTaskDocuments, deleteDocument } from "@/actions/documents"
import { ExtendedDocument } from "@/types/documents"
import { DOCUMENT_TYPE_ICONS, DOCUMENT_TYPE_COLORS } from "@/components/projects/document-utils"
import { DocumentListView } from "@/components/projects/document-list-view"
import { DocumentUploadDialog } from "@/components/projects/document-upload-dialog"
import { Button } from "@/components/ui/button"
import { ExternalLink, Trash2, Loader2, Link as LinkIcon, FileText } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ProofOfWorkSectionProps {
    taskId: string
    projectId: string
    initialDocuments?: ExtendedDocument[]
}

export function ProofOfWorkSection({ taskId, projectId, initialDocuments = [] }: ProofOfWorkSectionProps) {
    const [documents, setDocuments] = useState<ExtendedDocument[]>(initialDocuments)
    const [isLoading, setIsLoading] = useState(false)

    // Poll for updates or rely on parent revalidation? 
    // Let's implement a manual refresh effect for now when uploading happens via dialog
    
    const fetchDocuments = useCallback(async () => {
        setIsLoading(true)
        const docs = await getTaskDocuments(taskId)
        setDocuments(docs as ExtendedDocument[])
        setIsLoading(false)
    }, [taskId])

    useEffect(() => {
        fetchDocuments()
    }, [fetchDocuments])

    return (
        <div className="space-y-4">
             <div className="flex items-center justify-between">
                <DocumentUploadDialog 
                    projectId={projectId} 
                    taskId={taskId}
                    trigger={
                        <Button variant="outline" size="sm" className="h-8 gap-2">
                           <LinkIcon className="h-3.5 w-3.5" />
                           Add Proof
                        </Button>
                    }
                />
                
                {/* Invisible trigger to refresh when dialog closes? 
                    DocumentUploadDialog doesn't have an onSuccess callback prop yet.
                    We might need to modify it or assume revalidation handles it.
                    Actually, let's rely on a manual refresh button or modify Dialog.
                    Better: Modifying DocumentUploadDialog to accept onSuccess.
                */}
                 <Button variant="ghost" size="icon" onClick={fetchDocuments} className="h-8 w-8">
                    <Loader2 className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
                 </Button>
            </div>

            <div className="rounded-md border bg-muted/10 overflow-hidden">
                 {documents.length === 0 ? (
                    <div className="text-sm text-muted-foreground/60 italic py-8 text-center">
                        No proofs attached yet.
                    </div>
                 ) : (
                    // We need to wrap DocumentListView or ensure it fits. 
                    // DocumentListView has a Table, so it should be fine.
                    // We'll use a modified version or just the header-less usage if we could.
                    // But DocumentListView has headers. That's fine for "Make it look like Document Tab".
                    <div className="[&_th]:text-[10px] [&_td]:py-3 [&_td]:text-xs">
                        <DocumentListView documents={documents} onDelete={fetchDocuments} />
                    </div>
                 )}
            </div>
        </div>
    )
}
