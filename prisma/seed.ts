import { PrismaClient, UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Create demo users
  const adminPassword = await bcrypt.hash("admin123", 12)
  const userPassword = await bcrypt.hash("user123", 12)

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  })

  // Create regular user
  const regularUser = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      name: "Regular User",
      password: userPassword,
      role: UserRole.USER,
    },
  })

  console.log("👥 Created demo users:")
  console.log(`   Admin: ${adminUser.email} / admin123`)
  console.log(`   User: ${regularUser.email} / user123`)

  // Create sample patients
  const patients = [
    {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phoneNumber: "+1-555-0101",
      dob: new Date("1985-03-15"),
    },
    {
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      phoneNumber: "+1-555-0102",
      dob: new Date("1990-07-22"),
    },
    {
      firstName: "Michael",
      lastName: "Johnson",
      email: "michael.johnson@example.com",
      phoneNumber: "+1-555-0103",
      dob: new Date("1978-11-08"),
    },
    {
      firstName: "Emily",
      lastName: "Davis",
      email: "emily.davis@example.com",
      phoneNumber: "+1-555-0104",
      dob: new Date("1992-05-30"),
    },
    {
      firstName: "David",
      lastName: "Wilson",
      email: "david.wilson@example.com",
      phoneNumber: "+1-555-0105",
      dob: new Date("1987-09-12"),
    },
    {
      firstName: "Sarah",
      lastName: "Brown",
      email: "sarah.brown@example.com",
      phoneNumber: "+1-555-0106",
      dob: new Date("1995-01-18"),
    },
    {
      firstName: "Robert",
      lastName: "Miller",
      email: "robert.miller@example.com",
      phoneNumber: "+1-555-0107",
      dob: new Date("1982-06-25"),
    },
    {
      firstName: "Lisa",
      lastName: "Anderson",
      email: "lisa.anderson@example.com",
      phoneNumber: "+1-555-0108",
      dob: new Date("1988-12-03"),
    },
  ]

  console.log("🏥 Creating sample patients...")

  for (const patientData of patients) {
    await prisma.patient.upsert({
      where: { email: patientData.email },
      update: {},
      create: patientData,
    })
  }

  console.log(`✅ Created ${patients.length} sample patients`)
  console.log("🎉 Database seeding completed successfully!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("❌ Error during seeding:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
