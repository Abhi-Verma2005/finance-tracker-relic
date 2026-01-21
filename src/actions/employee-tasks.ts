'use server'

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { sendTaskCompletionEmail } from "@/lib/email"

export async function markTaskComplete(taskId: string) {
  const session = await auth()
  const employeeId = session?.user?.employeeId

  if (!employeeId || session.user.userType !== 'EMPLOYEE') {
    return { error: 'Unauthorized' }
  }

  try {
    const task = await db.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: true,
        project: true,
      },
    })

    if (!task || task.assigneeId !== employeeId) {
      return { error: 'Not your task' }
    }

    const updated = await db.task.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    })

    // Send completion email to admin
    if (process.env.ADMIN_NOTIFICATION_EMAIL && task.assignee) {
      await sendTaskCompletionEmail({
        adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL,
        employeeName: task.assignee.name,
        taskTitle: task.title,
        projectName: task.project.name,
        completedAt: updated.completedAt!,
      })
    }

    revalidatePath('/employee/tasks')
    return { success: true }
  } catch (error) {
    console.error('Mark task complete error:', error)
    return { error: 'Failed to mark task as complete' }
  }
}

export async function getEmployeeTasks() {
  const session = await auth()
  const employeeId = session?.user?.employeeId

  if (!employeeId) return []

  try {
    return await db.task.findMany({
      where: { assigneeId: employeeId },
      include: { project: true },
      orderBy: { dueDate: 'asc' },
    })
  } catch (error) {
    console.error('Get employee tasks error:', error)
    return []
  }
}
