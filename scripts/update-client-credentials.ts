/**
 * Update Client Credentials Script
 *
 * This script updates the existing client's email and password
 *
 * Run with: pnpm tsx scripts/update-client-credentials.ts
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
  console.log('Starting client credentials update...')

  try {
    // Find the existing client (John Boyd)
    const existingClient = await prisma.client.findFirst({
      where: {
        OR: [
          { email: 'john.boyd@example.com' },
          { name: 'John Boyd' },
        ],
      },
    })

    if (!existingClient) {
      console.log('❌ No client found to update. Run migration script first.')
      return
    }

    console.log(`Found client: ${existingClient.name} (${existingClient.email})`)

    // Hash the new password
    const hashedPassword = await bcrypt.hash('password123', 10)

    // Update client credentials
    const updatedClient = await prisma.client.update({
      where: { id: existingClient.id },
      data: {
        email: 'jrb2401@gmail.com',
        password: hashedPassword,
      },
    })

    console.log(`✅ Successfully updated client credentials!`)
    console.log('\nNew Client Portal Login:')
    console.log('  Email: jrb2401@gmail.com')
    console.log('  Password: password123')
    console.log('  URL: /client/login')

  } catch (error: any) {
    if (error.code === 'P2002') {
      console.error('❌ Error: Email jrb2401@gmail.com already exists in the database')
    } else {
      console.error('Update failed:', error)
      throw error
    }
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
