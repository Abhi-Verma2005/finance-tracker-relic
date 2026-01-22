'use server'

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { documentSchema, type DocumentData } from "@/lib/schemas"
import { revalidatePath } from "next/cache"

export async function createDocument(data: DocumentData, uploadedById: string) {
    const session = await auth()
    if (!session?.user?.companyId) {
        return { error: 'Unauthorized' }
    }

    try {
        const validated = documentSchema.parse(data)

        const document = await db.document.create({
            data: {
                ...validated,
                uploadedById,
            },
        })

        revalidatePath(`/admin/projects/${data.projectId}`)
        return { success: true, document }
    } catch (error) {
        console.error('Create document error:', error)
        return { error: 'Failed to create document' }
    }
}

export async function getProjectDocuments(projectId: string) {
    const session = await auth()
    if (!session?.user?.companyId) return []

    try {
        return await db.document.findMany({
            where: { projectId },
            include: { uploadedBy: true },
            orderBy: { createdAt: 'desc' },
        })
    } catch (error) {
        console.error('Get documents error:', error)
        return []
    }
}

export async function deleteDocument(id: string) {
    const session = await auth()
    if (!session?.user?.companyId || session.user.userType !== 'ADMIN') {
        return { error: 'Unauthorized' }
    }

    try {
        const doc = await db.document.delete({ where: { id } })
        revalidatePath(`/admin/projects/${doc.projectId}`)
        return { success: true }
    } catch (error) {
        console.error('Delete document error:', error)
        return { error: 'Failed to delete document' }
    }
}
