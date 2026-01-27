import { getProjectById } from "@/actions/projects"
import { FinancesTab } from "@/components/projects/finances-tab"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export default async function ProjectFinancesPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const session = await auth()
  const project = await getProjectById(id)

  if (!project) notFound()

  // Get finances from tag
  // We need to cast or ensure project includes tag. getProjectById includes it.
  const projectWithTag = project as any
  
  const tagIncomes = projectWithTag.tag ? await db.income.findMany({
    where: { tags: { some: { tagId: projectWithTag.tag.id } } },
    orderBy: { date: 'desc' },
  }) : []

  const tagExpenditures = projectWithTag.tag ? await db.expenditure.findMany({
    where: { tags: { some: { tagId: projectWithTag.tag.id } } },
    include: { employee: true },
    orderBy: { date: 'desc' },
  }) : []

  // Fetch data for logging dialogs
  const [accounts, tags, employees, categories] = await Promise.all([
    db.account.findMany({ where: { companyId: session?.user?.companyId } }),
    db.tag.findMany({ where: { companyId: session?.user?.companyId } }),
    db.employee.findMany({ where: { companyId: session?.user?.companyId, status: "ACTIVE" } }),
    db.category.findMany({ 
        where: { 
            OR: [
                { companyId: session?.user?.companyId },
                { companyId: null, isSystem: true }
            ],
            type: { in: ["EXPENSE", "INCOME", "BOTH"] }
        } 
    }),
  ])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Finances</h2>
      <FinancesTab
        tag={projectWithTag.tag}
        incomes={tagIncomes}
        expenditures={tagExpenditures}
        accounts={accounts}
        tags={tags}
        employees={employees}
        categories={categories}
      />
    </div>
  )
}
