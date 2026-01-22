'use server'

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { moduleSchema, subModuleSchema, type ModuleData, type SubModuleData } from "@/lib/schemas"
import { revalidatePath } from "next/cache"

export async function createModule(data: ModuleData) {
    const session = await auth()
    if (!session?.user?.companyId || session.user.userType !== 'ADMIN') {
        return { error: 'Unauthorized' }
    }

    try {
        const validated = moduleSchema.parse(data)

        const module = await db.module.create({
            data: validated,
        })

        revalidatePath(`/admin/projects/${data.projectId}`)
        return { success: true, module }
    } catch (error) {
        console.error('Create module error:', error)
        return { error: 'Failed to create module' }
    }
}

export async function createSubModule(data: SubModuleData) {
    const session = await auth()
    if (!session?.user?.companyId || session.user.userType !== 'ADMIN') {
        return { error: 'Unauthorized' }
    }

    try {
        const validated = subModuleSchema.parse(data)

        const subModule = await db.subModule.create({
            data: validated,
        })

        const module = await db.module.findUnique({
            where: { id: data.moduleId },
            select: { projectId: true },
        })

        if (module) {
            revalidatePath(`/admin/projects/${module.projectId}`)
        }

        return { success: true, subModule }
    } catch (error) {
        console.error('Create submodule error:', error)
        return { error: 'Failed to create submodule' }
    }
}

export async function getProjectModules(projectId: string) {
    const session = await auth()
    if (!session?.user?.companyId) return []

    try {
        return await db.module.findMany({
            where: { projectId },
            include: {
                subModules: {
                    include: {
                        tasks: {
                            include: { assignee: true },
                        },
                    },
                    orderBy: { order: 'asc' },
                },
            },
            orderBy: { order: 'asc' },
        })
    } catch (error) {
        console.error('Get modules error:', error)
        return []
    }
}

export async function reorderModules(projectId: string, moduleIds: string[]) {
    const session = await auth()
    if (!session?.user?.companyId || session.user.userType !== 'ADMIN') {
        return { error: 'Unauthorized' }
    }

    try {
        await db.$transaction(
            moduleIds.map((id, index) =>
                db.module.update({
                    where: { id },
                    data: { order: index },
                })
            )
        )

        revalidatePath(`/admin/projects/${projectId}`)
        return { success: true }
    } catch (error) {
        console.error('Reorder modules error:', error)
        return { error: 'Failed to reorder modules' }
    }
}
