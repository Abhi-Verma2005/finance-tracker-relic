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
import { ExpenditureForm } from "@/components/forms/expenditure-form"
import { useState } from "react"
import { Plus } from "lucide-react"

interface ExpenditureDialogProps {
  accounts: any[]
  tags: any[]
  employees?: any[]
  categories?: any[]
  initialData?: any
  id?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
  showTrigger?: boolean
}

export function ExpenditureDialog({ 
  accounts, 
  tags, 
  employees = [], 
  categories = [], 
  initialData,
  id,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  children,
  showTrigger = true
}: ExpenditureDialogProps) {
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
              Log Expense
            </Button>
          </DialogTrigger>
        )
      ) : null}
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{id ? "Edit Expenditure" : "Log Expenditure"}</DialogTitle>
          <DialogDescription>
            {id ? "Update expense details." : "Record a new expense and deduct from account balance."}
          </DialogDescription>
        </DialogHeader>
        <ExpenditureForm
          id={id}
          initialData={initialData}
          accounts={accounts}
          tags={tags}
          employees={employees}
          categories={categories}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
