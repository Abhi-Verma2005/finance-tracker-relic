import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Checking existing employees...')

  // Get all employees
  const employees = await prisma.employee.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
  })

  console.log(`Found ${employees.length} employees:`)
  employees.forEach((emp, index) => {
    console.log(`${index + 1}. ${emp.name} - Email: ${emp.email || '(none)'}`)
  })

  // Check for duplicate emails
  const emails = employees.map(e => e.email).filter(e => e !== null)
  const duplicates = emails.filter((email, index) => emails.indexOf(email) !== index)

  if (duplicates.length > 0) {
    console.log('\n⚠️  Warning: Duplicate emails found:')
    duplicates.forEach(email => console.log(`  - ${email}`))
  }

  // Check for null emails
  const nullEmails = employees.filter(e => !e.email)
  if (nullEmails.length > 0) {
    console.log(`\n⚠️  Warning: ${nullEmails.length} employees have no email:`)
    nullEmails.forEach(emp => console.log(`  - ${emp.name} (${emp.id})`))
  }

  console.log('\nReady to proceed with migration.')
  console.log('Note: Email and password fields are currently optional.')
  console.log('Phase 9 will set default values for existing employees.')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
