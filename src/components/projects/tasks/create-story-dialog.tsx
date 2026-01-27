"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createModule } from "@/actions/modules"
import { toast } from "sonner"
import { Plus, Loader2 } from "lucide-react"

interface CreateStoryDialogProps {
  projectId: string
}

export function CreateStoryDialog({ projectId }: CreateStoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    const result = await createModule(projectId, name)
    setLoading(false)

    if (result.success) {
      toast.success("Story created")
      setOpen(false)
      setName("")
    } else {
      toast.error("Failed to create story")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-dashed">
            <Plus className="h-4 w-4" />
            Add Story
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Major Story</DialogTitle>
          <DialogDescription>
            Group related tasks under a major story or module.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Story Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g., Authentication"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!name.trim() || loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Story
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
