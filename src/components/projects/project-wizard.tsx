"use client"

import { useState } from "react"
import { useForm, Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { projectSchema, ProjectData } from "@/lib/schemas"
import { createProject } from "@/actions/projects"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, ChevronRight, ChevronLeft } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"

interface ProjectWizardProps {
  clients: any[]
}

export function ProjectWizard({ clients }: ProjectWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isPending, setIsPending] = useState(false)

  const form = useForm<ProjectData>({
    resolver: zodResolver(projectSchema) as unknown as Resolver<ProjectData>,
    defaultValues: {
      name: "",
      description: "",
      status: "PLANNING",
      startDate: undefined,
      endDate: undefined,
      clientId: undefined,
      hasUpworkTimesheet: false,
      upworkContractUrl: "",
    },
  })

  const totalSteps = 3

  async function onSubmit(data: ProjectData) {
    setIsPending(true)
    try {
      const result = await createProject(data)

      if (result?.error) {
        toast.error(result.error)
      } else if (result?.project) {
        toast.success("Project created successfully")
        router.push(`/admin/projects/${result.project.id}`)
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsPending(false)
    }
  }

  const nextStep = async () => {
    const fields = step === 1
      ? ["name", "description", "status", "startDate", "endDate"]
      : step === 2
      ? ["clientId"]
      : []

    const isValid = await form.trigger(fields as any)
    if (isValid && step < totalSteps) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i + 1 === step ? "w-8 bg-primary" : i + 1 < step ? "w-8 bg-primary/50" : "w-8 bg-muted"
                )}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            Step {step} of {totalSteps}
          </span>
        </div>
        <CardTitle>
          {step === 1 && "Project Details"}
          {step === 2 && "Client Assignment"}
          {step === 3 && "Upwork Integration"}
        </CardTitle>
        <CardDescription>
          {step === 1 && "Enter basic information about the project"}
          {step === 2 && "Select a client for this project (optional)"}
          {step === 3 && "Configure Upwork timesheet tracking if needed"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Website Redesign" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Project description..."
                          {...field}
                          value={field.value || ""}
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PLANNING">Planning</SelectItem>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="ON_HOLD">On Hold</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a client (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No Client</SelectItem>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name} ({client.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Assign this project to a client for portal access
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {clients.length === 0 && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      No clients found. You can create clients from the Clients page.
                    </p>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="hasUpworkTimesheet"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Enable Upwork Timesheet Tracking
                        </FormLabel>
                        <FormDescription>
                          Track this project with Upwork timesheets and receive weekly reminders
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch("hasUpworkTimesheet") && (
                  <FormField
                    control={form.control}
                    name="upworkContractUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Upwork Contract URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://www.upwork.com/..."
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Link to the Upwork contract for quick access
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={step === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {step < totalSteps ? (
                <Button type="button" onClick={nextStep}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Creating..." : "Create Project"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
