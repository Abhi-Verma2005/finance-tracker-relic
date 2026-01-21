'use server'

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { projectSchema, type ProjectData } from "@/lib/schemas"
import { revalidatePath } from "next/cache"

export async function createProject(data: ProjectData) {
  const session = await auth()
  if (!session?.user?.companyId || session.user.userType !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  try {
    const validated = projectSchema.parse(data)

    const project = await db.project.create({
      data: {
        ...validated,
        companyId: session.user.companyId,
      },
    })

    revalidatePath('/admin/projects')
    return { success: true, project }
  } catch (error) {
    console.error('Create project error:', error)
    return { error: 'Failed to create project' }
  }
}

export async function updateProject(id: string, data: Partial<ProjectData>) {
  const session = await auth()
  if (!session?.user?.companyId || session.user.userType !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  try {
    const project = await db.project.update({
      where: {
        id,
        companyId: session.user.companyId,
      },
      data,
    })

    revalidatePath('/admin/projects')
    revalidatePath(`/admin/projects/${id}`)
    return { success: true, project }
  } catch (error) {
    console.error('Update project error:', error)
    return { error: 'Failed to update project' }
  }
}

export async function deleteProject(id: string) {
  const session = await auth()
  if (!session?.user?.companyId || session.user.userType !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  try {
    await db.project.delete({
      where: {
        id,
        companyId: session.user.companyId,
      },
    })

    revalidatePath('/admin/projects')
    return { success: true }
  } catch (error) {
    console.error('Delete project error:', error)
    return { error: 'Failed to delete project' }
  }
}

export async function getProjects() {
  const session = await auth()
  if (!session?.user?.companyId) return []

  try {
    return await db.project.findMany({
      where: { companyId: session.user.companyId },
      include: {
        tasks: {
          include: { assignee: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    console.error('Get projects error:', error)
    return []
  }
}

export async function getProjectById(id: string) {
  const session = await auth()
  if (!session?.user?.companyId) return null

  try {
    return await db.project.findUnique({
      where: {
        id,
        companyId: session.user.companyId,
      },
      include: {
        tasks: {
          include: { assignee: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    })
  } catch (error) {
    console.error('Get project error:', error)
    return null
  }
}
