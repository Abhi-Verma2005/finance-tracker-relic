'use server'

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { projectEmployeeSchema, type ProjectEmployeeData } from "@/lib/schemas"
import { revalidatePath } from "next/cache"

export async function assignEmployee(data: ProjectEmployeeData) {
    const session = await auth()
    if (!session?.user?.companyId || session.user.userType !== 'ADMIN') {
        return { error: 'Unauthorized' }
    }

    try {
        const validated = projectEmployeeSchema.parse(data)

        const assignment = await db.projectEmployee.create({
            data: validated,
        })

        revalidatePath(`/admin/projects/${data.projectId}`)
        return { success: true, assignment }
    } catch (error) {
        console.error('Assign employee error:', error)
        return { error: 'Failed to assign employee' }
    }
}

export async function removeEmployee(projectId: string, employeeId: string) {
    const session = await auth()
    if (!session?.user?.companyId || session.user.userType !== 'ADMIN') {
        return { error: 'Unauthorized' }
    }

    try {
        await db.projectEmployee.delete({
            where: {
                projectId_employeeId: {
                    projectId,
                    employeeId,
                },
            },
        })

        revalidatePath(`/admin/projects/${projectId}`)
        return { success: true }
    } catch (error) {
        console.error('Remove employee error:', error)
        return { error: 'Failed to remove employee' }
    }
}

export async function getProjectTeam(projectId: string) {
    const session = await auth()
    if (!session?.user?.companyId) return []

    try {
        return await db.projectEmployee.findMany({
            where: { projectId },
            include: {
                employee: {
                    include: {
                        tasksAssigned: {
                            where: { projectId },
                            select: {
                                id: true,
                                title: true,
                                status: true,
                            },
                        },
                    },
                },
            },
        })
    } catch (error) {
        console.error('Get team error:', error)
        return []
    }
}
