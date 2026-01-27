"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Link as LinkIcon, FileUp, Loader2 } from "lucide-react"
import { uploadDocument, createLinkDocument } from "@/actions/documents"
import { toast } from "sonner"

interface DocumentUploadDialogProps {
  projectId: string
  trigger?: React.ReactNode
}

export function DocumentUploadDialog({ projectId, taskId, trigger }: { projectId: string; taskId?: string; trigger?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState("")

  // Link State
  const [linkUrl, setLinkUrl] = useState("")
  const [linkName, setLinkName] = useState("")

  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return

    setLoading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('name', fileName || selectedFile.name)

    const result = await uploadDocument(formData, projectId, taskId)

    setLoading(false)
    if (result.success) {
      toast.success("Document uploaded successfully")
      setIsOpen(false)
      setSelectedFile(null)
      setFileName("")
    } else {
      toast.error("Failed to upload document")
    }
  }

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!linkUrl || !linkName) return

    setLoading(true)
    const result = await createLinkDocument({
      projectId,
      url: linkUrl,
      name: linkName,
      taskId: taskId
    })

    setLoading(false)
    if (result.success) {
      toast.success("Link added successfully")
      setIsOpen(false)
      setLinkUrl("")
      setLinkName("")
    } else {
      toast.error("Failed to add link")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Add Document
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Document</DialogTitle>
          <DialogDescription>
            Upload a file or paste a link to an external resource.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="gap-2">
              <FileUp className="h-4 w-4" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="link" className="gap-2">
              <LinkIcon className="h-4 w-4" />
              Paste Link
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4 mt-4">
            <form onSubmit={handleFileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">File</Label>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                      </p>
                    </div>
                    <input 
                      id="file-upload" 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setSelectedFile(file)
                          if (!fileName) setFileName(file.name)
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filename">Display Name (Optional)</Label>
                <Input 
                  id="filename" 
                  placeholder="custom-name.pdf" 
                  value={fileName} 
                  onChange={(e) => setFileName(e.target.value)} 
                />
              </div>

              <Button type="submit" className="w-full" disabled={!selectedFile || loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Upload
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="link" className="space-y-4 mt-4">
            <form onSubmit={handleLinkSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">Resource URL</Label>
                <Input 
                  id="url" 
                  placeholder="https://docs.google.com/..." 
                  value={linkUrl} 
                  onChange={(e) => setLinkUrl(e.target.value)} 
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkName">Title</Label>
                <Input 
                  id="linkName" 
                  placeholder="Q1 Report" 
                  value={linkName} 
                  onChange={(e) => setLinkName(e.target.value)} 
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={!linkUrl || !linkName || loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add Link
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
