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
import { IncomeForm } from "@/components/forms/income-form"
import { useState } from "react"
import { Plus } from "lucide-react"

interface IncomeDialogProps {
  accounts: any[]
  tags: any[]
  categories?: any[]
  initialData?: any
  id?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
  showTrigger?: boolean
}

export function IncomeDialog({ 
  accounts, 
  tags, 
  categories = [], 
  initialData,
  id,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  children,
  showTrigger = true
}: IncomeDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled && controlledOnOpenChange ? controlledOnOpenChange : setInternalOpen

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showTrigger ? (
        children ? (
          <DialogTrigger asChild>
            {children}
          </DialogTrigger>
        ) : (
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Log Income
            </Button>
          </DialogTrigger>
        )
      ) : null}
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{id ? "Edit Income" : "Log Income"}</DialogTitle>
          <DialogDescription>
            {id ? "Update income details." : "Record a new income source and add to account balance."}
          </DialogDescription>
        </DialogHeader>
        <IncomeForm
          id={id}
          initialData={initialData}
          accounts={accounts}
          tags={tags}
          categories={categories}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
