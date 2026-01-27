"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function addComment(taskId: string | null, content: string, projectId: string) {
    const session = await auth()
    if (!session?.user?.companyId || !session.user.id) return { error: 'Unauthorized' }

    try {
        const comment = await db.comment.create({
            data: {
                content,
                taskId,
                projectId,
                userId: session.user.id,
                // Client vs User logic needed if user is client. 
                // Assuming session has info. For now default to userId.
            }
        })
        revalidatePath(`/admin/projects/${projectId}/tasks`)
        return { success: true, comment }
    } catch (error) {
        return { error: 'Failed to add comment' }
    }
}

export async function getTaskComments(taskId: string) {
    const session = await auth()
    if (!session?.user?.companyId) return []

    try {
        return await db.comment.findMany({
            where: { taskId },
            include: {
                user: { select: { id: true, name: true, userType: true } },
                client: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'desc' }
        })
    } catch (error) {
        return []
    }
}
