"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { ApprovalStatus } from "@prisma/client"

export async function approveTask(id: string) {
    const session = await auth()
    if (!session?.user?.companyId) return { success: false, error: 'Unauthorized' }

    return updateApprovalStatus(id, "APPROVED")
}

export async function rejectTask(id: string) {
    const session = await auth()
    if (!session?.user?.companyId) return { success: false, error: 'Unauthorized' }

    return updateApprovalStatus(id, "REJECTED")
}

export async function requestChangesTask(id: string) {
    const session = await auth()
    if (!session?.user?.companyId) return { success: false, error: 'Unauthorized' }

    // Logic: Set status back to IN_PROGRESS and approval to REJECTED or similar?
    // For now, let's just use REJECTED approval status.
    return updateApprovalStatus(id, "REJECTED")
}

async function updateApprovalStatus(id: string, status: ApprovalStatus) {
    try {
        const task = await db.task.update({
            where: { id },
            data: { approvalStatus: status }
        })
        revalidatePath(`/admin/projects/${task.projectId}/tasks`)
        return { success: true, task }
    } catch (error) {
        return { success: false, error: 'Failed to update approval status' }
    }
}
