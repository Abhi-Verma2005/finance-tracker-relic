'use server'

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { taskSchema, type TaskData } from "@/lib/schemas"
import { revalidatePath } from "next/cache"
import { sendTaskAssignmentEmail } from "@/lib/email"

export async function createTask(data: TaskData) {
  const session = await auth()
  if (!session?.user?.companyId || session.user.userType !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  try {
    const validated = taskSchema.parse(data)

    const task = await db.task.create({
      data: validated,
      include: {
        assignee: true,
        project: true,
      },
    })

    // Send email notification if assigned
    if (task.assigneeId && task.assignee && task.assignee.email) {
      await sendTaskAssignmentEmail({
        employeeEmail: task.assignee.email,
        employeeName: task.assignee.name,
        taskTitle: task.title,
        taskDescription: task.description,
        projectName: task.project.name,
        dueDate: task.dueDate,
      })
    }

    revalidatePath('/admin/projects')
    revalidatePath(`/admin/projects/${task.projectId}`)
    return { success: true, task }
  } catch (error) {
    console.error('Create task error:', error)
    return { error: 'Failed to create task' }
  }
}

export async function updateTask(taskId: string, data: Partial<TaskData>) {
  const session = await auth()
  if (session?.user?.userType !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  try {
    const existing = await db.task.findUnique({
      where: { id: taskId },
      include: { assignee: true },
    })

    const task = await db.task.update({
      where: { id: taskId },
      data,
      include: {
        assignee: true,
        project: true,
      },
    })

    // Auto-create daily log if task was just completed
    if (data.status === 'COMPLETED' && existing?.status !== 'COMPLETED' && task.assigneeId) {
      await db.dailyLog.create({
        data: {
          projectId: task.projectId,
          employeeId: task.assigneeId,
          taskId: task.id,
          description: `Completed: "${task.title}"`,
          hoursSpent: task.actualHours || task.estimatedHours,
          source: 'AUTO_TASK_COMPLETE',
          date: new Date(),
        },
      })
    }

    // Send email if reassigned
    if (
      data.assigneeId &&
      data.assigneeId !== existing?.assigneeId &&
      task.assignee &&
      task.assignee.email
    ) {
      await sendTaskAssignmentEmail({
        employeeEmail: task.assignee.email,
        employeeName: task.assignee.name,
        taskTitle: task.title,
        taskDescription: task.description,
        projectName: task.project.name,
        dueDate: task.dueDate,
      })
    }

    revalidatePath('/admin/projects')
    revalidatePath(`/admin/projects/${task.projectId}`)
    return { success: true, task }
  } catch (error) {
    console.error('Update task error:', error)
    return { error: 'Failed to update task' }
  }
}

export async function deleteTask(taskId: string) {
  const session = await auth()
  if (session?.user?.userType !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  try {
    const task = await db.task.delete({
      where: { id: taskId },
    })

    revalidatePath('/admin/projects')
    revalidatePath(`/admin/projects/${task.projectId}`)
    return { success: true }
  } catch (error) {
    console.error('Delete task error:', error)
    return { error: 'Failed to delete task' }
  }
}

export async function getEmployeesForAssignment() {
  const session = await auth()
  if (!session?.user?.companyId) return []

  try {
    return await db.employee.findMany({
      where: {
        companyId: session.user.companyId,
        status: 'ACTIVE',
        email: { not: null },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: { name: 'asc' },
    })
  } catch (error) {
    console.error('Get employees error:', error)
    return []
  }
}
