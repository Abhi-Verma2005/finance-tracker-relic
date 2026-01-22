/**
 * Data Migration Script: Convert existing project to one-to-one client relationship
 *
 * This script will:
 * 1. Create a client named "John Boyd"
 * 2. Link the existing project to this client
 *
 * Run with: pnpm tsx scripts/migrate-to-one-to-one.ts
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Starting migration to one-to-one client-project relationship...')

  try {
    // Get the existing project(s)
    const projects = await prisma.project.findMany({
      where: {
        clientId: null,
      },
      include: {
        company: true,
      },
    })

    console.log(`Found ${projects.length} project(s) without a client`)

    if (projects.length === 0) {
      console.log('No projects to migrate. All projects already have clients.')
      return
    }

    // Take the first project (as per user's requirement)
    const project = projects[0]
    console.log(`Migrating project: ${project.name}`)

    // Create John Boyd client
    const hashedPassword = await bcrypt.hash('password123', 10)

    const client = await prisma.client.create({
      data: {
        name: 'John Boyd',
        email: 'jrb2401@gmail.com',
        password: hashedPassword,
        companyId: project.companyId,
      },
    })

    console.log(`Created client: ${client.name} (${client.email})`)

    // Link the project to this client
    await prisma.project.update({
      where: { id: project.id },
      data: { clientId: client.id },
    })

    console.log(`Successfully linked project "${project.name}" to client "${client.name}"`)
    console.log('\n✅ Migration completed successfully!')
    console.log('\nClient Portal Login:')
    console.log('  Email: jrb2401@gmail.com')
    console.log('  Password: password123')
    console.log('  URL: /client/login')

  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
