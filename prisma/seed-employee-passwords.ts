import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Setting default passwords for existing employees...\n')

  const defaultPassword = 'test1234@'
  const hashedPassword = await bcrypt.hash(defaultPassword, 10)

  // Get all employees
  const employees = await prisma.employee.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
    },
  })

  console.log(`Found ${employees.length} employees\n`)

  // Check for employees without passwords
  const employeesWithoutPasswords = employees.filter(e => !e.password)
  console.log(`${employeesWithoutPasswords.length} employees need passwords\n`)

  if (employeesWithoutPasswords.length === 0) {
    console.log('All employees already have passwords!')
    return
  }

  // Update employees without passwords
  let updated = 0
  let skipped = 0

  for (const employee of employeesWithoutPasswords) {
    // Ensure email is set (required for login)
    if (!employee.email) {
      console.warn(`⚠️  Skipping ${employee.name} (${employee.id}) - no email address`)
      skipped++
      continue
    }

    await prisma.employee.update({
      where: { id: employee.id },
      data: { password: hashedPassword },
    })

    console.log(`✓ Set password for ${employee.name} (${employee.email})`)
    updated++
  }

  console.log(`\n✅ Migration complete!`)
  console.log(`   Updated: ${updated} employees`)
  if (skipped > 0) {
    console.log(`   Skipped: ${skipped} employees (no email)`)
  }
  console.log(`\n   Default password: ${defaultPassword}`)
  console.log(`   Employees can now log in with their email and this password`)
  console.log(`   Admins should update passwords via the employee management interface\n`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
