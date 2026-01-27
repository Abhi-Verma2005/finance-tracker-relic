
import { db } from "@/lib/db"

async function main() {
    console.log("--- Users ---")
    const users = await db.user.findMany({
        where: { userType: 'ADMIN' },
        select: { id: true, email: true, name: true, employeeId: true }
    })
    console.log(users)

    console.log("\n--- Employees ---")
    const employees = await db.employee.findMany({
        select: { id: true, email: true, name: true }
    })
    console.log(employees)
}

main()
