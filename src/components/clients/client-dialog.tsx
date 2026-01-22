"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ClientForm } from "@/components/forms/client-form"
import { useState } from "react"
import { UserPlus } from "lucide-react"

interface ClientDialogProps {
  client?: any
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ClientDialog({ client, trigger, open, onOpenChange }: ClientDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)

  const isControlled = open !== undefined
  const show = isControlled ? open : internalOpen
  const setShow = isControlled ? onOpenChange! : setInternalOpen

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{client ? "Edit Client" : "Create Client & Project"}</DialogTitle>
          <DialogDescription>
            {client ? "Update client details" : "Create a new client account with an associated project"}
          </DialogDescription>
        </DialogHeader>
        <ClientForm client={client} onSuccess={() => setShow(false)} />
      </DialogContent>
    </Dialog>
  )
}
