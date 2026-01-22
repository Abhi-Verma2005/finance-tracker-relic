"use client"

import { useForm, Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClientWithProject, updateClient } from "@/actions/clients"
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
import { toast } from "sonner"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

// Combined schema for creating client with project
const clientProjectSchema = z.object({
  // Client fields
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).optional().or(z.literal("")),

  // Project fields
  projectName: z.string().min(2, { message: "Project name must be at least 2 characters" }),
  projectDescription: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  hasUpworkTimesheet: z.boolean().default(false),
  upworkContractUrl: z.string().url().optional().or(z.literal("")),
})

type ClientProjectData = z.infer<typeof clientProjectSchema>

interface ClientFormProps {
  client?: any
  onSuccess?: () => void
}

export function ClientForm({ client, onSuccess }: ClientFormProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  const form = useForm<ClientProjectData>({
    resolver: zodResolver(clientProjectSchema) as unknown as Resolver<ClientProjectData>,
    defaultValues: {
      name: client?.name || "",
      email: client?.email || "",
      password: "",
      projectName: client?.projects?.[0]?.name || "",
      projectDescription: client?.projects?.[0]?.description || "",
      startDate: client?.projects?.[0]?.startDate ? new Date(client.projects[0].startDate) : undefined,
      endDate: client?.projects?.[0]?.endDate ? new Date(client.projects[0].endDate) : undefined,
      hasUpworkTimesheet: client?.projects?.[0]?.hasUpworkTimesheet || false,
      upworkContractUrl: client?.projects?.[0]?.upworkContractUrl || "",
    },
  })

  async function onSubmit(data: ClientProjectData) {
    setIsPending(true)
    try {
      const result = client
        ? await updateClient(client.id, data)
        : await createClientWithProject(data)

      if (result?.error) {
        toast.error(result.error)
      } else if (result?.success) {
        toast.success(client ? "Client updated" : "Client and project created successfully")
        if (onSuccess) onSuccess()
        if (!client && 'projectId' in result && result.projectId) {
          router.push(`/admin/projects/${result.projectId}`)
        }
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Client Information</h3>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="client@example.com" {...field} />
                </FormControl>
                <FormDescription>
                  Used for client portal login
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password {client && "(Leave empty to keep current)"}</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••" {...field} />
                </FormControl>
                <FormDescription>
                  Client portal login password
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="border-t pt-6 space-y-4">
          <h3 className="text-lg font-semibold">Project Details</h3>

          <FormField
            control={form.control}
            name="projectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input placeholder="Website Redesign" {...field} />
                </FormControl>
                <FormDescription>
                  One project will be created and linked to this client
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="projectDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Project description..."
                    {...field}
                    value={field.value || ""}
                    rows={3}
                  />
                </FormControl>
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
                    Track this project with Upwork timesheets
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
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : client ? "Update Client" : "Create Client & Project"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
