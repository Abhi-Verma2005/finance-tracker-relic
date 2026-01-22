'use server'

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { dailyLogSchema, type DailyLogData } from "@/lib/schemas"
import { revalidatePath } from "next/cache"

export async function createManualLog(data: DailyLogData) {
    const session = await auth()
    if (!session?.user?.companyId || session.user.userType !== 'ADMIN') {
        return { error: 'Unauthorized' }
    }

    try {
        const validated = dailyLogSchema.parse(data)

        const log = await db.dailyLog.create({
            data: validated,
        })

        revalidatePath(`/admin/projects/${data.projectId}`)
        return { success: true, log }
    } catch (error) {
        console.error('Create daily log error:', error)
        return { error: 'Failed to create log' }
    }
}

export async function createAutoLog(taskId: string, employeeId: string) {
    try {
        const task = await db.task.findUnique({
            where: { id: taskId },
            select: { projectId: true, title: true, actualHours: true, estimatedHours: true },
        })

        if (!task) return { error: 'Task not found' }

        const log = await db.dailyLog.create({
            data: {
                projectId: task.projectId,
                employeeId,
                taskId,
                description: `Completed: "${task.title}"`,
                hoursSpent: task.actualHours || task.estimatedHours,
                source: 'AUTO_TASK_COMPLETE',
                date: new Date(),
            },
        })

        revalidatePath(`/admin/projects/${task.projectId}`)
        return { success: true, log }
    } catch (error) {
        console.error('Create auto log error:', error)
        return { error: 'Failed to create auto log' }
    }
}

export async function getProjectLogs(projectId: string) {
    const session = await auth()
    if (!session?.user?.companyId) return []

    try {
        return await db.dailyLog.findMany({
            where: { projectId },
            include: {
                employee: true,
                task: true,
            },
            orderBy: { date: 'desc' },
        })
    } catch (error) {
        console.error('Get logs error:', error)
        return []
    }
}
