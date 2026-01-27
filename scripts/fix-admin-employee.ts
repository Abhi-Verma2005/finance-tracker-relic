
import { db } from "@/lib/db"

async function main() {
    const adminEmail = 'admin@relicwave.com'

    console.log(`Checking for admin user: ${adminEmail}`)
    const user = await db.user.findUnique({
        where: { email: adminEmail }
    })

    if (!user) {
        console.error("Admin user not found!")
        return
    }

    console.log("Admin found. Checking for existing employee profile...")
    let employee = await db.employee.findUnique({
        where: { email: adminEmail }
    })

    if (!employee) {
        console.log("Creating Employee profile for Admin...")
        employee = await db.employee.create({
            data: {
                name: user.name || 'Admin',
                email: adminEmail,
                role: 'Project Manager',
                department: 'Management',
                status: 'ACTIVE',
                employeeType: 'EMPLOYEE',
                companyId: user.companyId!
            }
        })
        console.log(`Employee created: ${employee.id}`)
    } else {
        console.log(`Employee profile exists: ${employee.id}`)
    }

    console.log("Linking User to Employee...")
    await db.user.update({
        where: { id: user.id },
        data: { employeeId: employee.id }
    })

    console.log("Done! You may need to re-login.")
}

main()
