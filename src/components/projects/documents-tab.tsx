'use client'

import { useState } from "react"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { createDocument } from "@/actions/documents"
import { useRouter } from "next/navigation"

const DOCUMENT_TYPE_ICONS = {
    CONTRACT: "📄",
    INVOICE: "🧾",
    DESIGN: "🎨",
    SOW: "📋",
    REPORT: "📊",
    IMAGE: "🖼️",
    VIDEO: "🎬",
    OTHER: "📁",
}

const DOCUMENT_TYPES = Object.keys(DOCUMENT_TYPE_ICONS) as Array<keyof typeof DOCUMENT_TYPE_ICONS>

export function DocumentsTab({ projectId, documents, userId }: any) {
    const router = useRouter()
    const [uploading, setUploading] = useState(false)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            // TODO: Upload to Cloudinary
            const url = `https://example.com/${file.name}` // Placeholder

            await createDocument({
                name: file.name,
                url,
                type: 'OTHER',
                projectId,
            }, userId)

            router.refresh()
        } catch (error) {
            console.error('Upload failed:', error)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Documents</h3>
                <label>
                    <Button disabled={uploading} asChild>
                        <span>
                            <Upload className="h-4 w-4 mr-2" />
                            {uploading ? 'Uploading...' : 'Upload Document'}
                        </span>
                    </Button>
                    <input
                        type="file"
                        className="hidden"
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                </label>
            </div>

            {documents.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                    No documents yet. Upload your first file.
                </Card>
            ) : (
                <div className="space-y-2">
                    {documents.map((doc: any) => (
                        <Card key={doc.id} className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{DOCUMENT_TYPE_ICONS[doc.type as keyof typeof DOCUMENT_TYPE_ICONS]}</span>
                                <div>
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
                                        {doc.name}
                                    </a>
                                    <p className="text-xs text-muted-foreground">
                                        Uploaded by {doc.uploadedBy.name} on {new Date(doc.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm">
                                <X className="h-4 w-4" />
                            </Button>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
