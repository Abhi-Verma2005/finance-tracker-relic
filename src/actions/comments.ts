'use server'

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { commentSchema, type CommentData } from "@/lib/schemas"
import { revalidatePath } from "next/cache"

export async function createComment(data: CommentData, userId?: string, clientId?: string) {
    const session = await auth()
    if (!session?.user && !clientId) {
        return { error: 'Unauthorized' }
    }

    try {
        const validated = commentSchema.parse(data)

        const comment = await db.comment.create({
            data: {
                ...validated,
                userId,
                clientId,
            },
        })

        revalidatePath(`/admin/projects/${data.projectId}`)
        revalidatePath(`/client/${data.projectId}`)
        return { success: true, comment }
    } catch (error) {
        console.error('Create comment error:', error)
        return { error: 'Failed to create comment' }
    }
}

export async function getProjectComments(projectId: string) {
    try {
        return await db.comment.findMany({
            where: {
                projectId,
                parentId: null,
            },
            include: {
                user: true,
                client: true,
                replies: {
                    include: {
                        user: true,
                        client: true,
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        })
    } catch (error) {
        console.error('Get comments error:', error)
        return []
    }
}

export async function deleteComment(id: string) {
    const session = await auth()
    if (!session?.user?.companyId || session.user.userType !== 'ADMIN') {
        return { error: 'Unauthorized' }
    }

    try {
        const comment = await db.comment.delete({ where: { id } })
        revalidatePath(`/admin/projects/${comment.projectId}`)
        return { success: true }
    } catch (error) {
        console.error('Delete comment error:', error)
        return { error: 'Failed to delete comment' }
    }
}
