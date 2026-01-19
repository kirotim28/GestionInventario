import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL || 'mysql://user:password@localhost:3306/gestion_inventario'
const adapter = new PrismaMariaDb(connectionString)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting seed...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@emi.edu' },
    update: {},
    create: {
      nombre: 'Administrador',
      email: 'admin@emi.edu',
      password: adminPassword,
      rol: 'ADMIN',
      estado: 'ACTIVO',
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // Create encargado user
  const encargadoPassword = await bcrypt.hash('encargado123', 10)
  const encargado = await prisma.user.upsert({
    where: { email: 'encargado@emi.edu' },
    update: {},
    create: {
      nombre: 'Encargado de Inventario',
      email: 'encargado@emi.edu',
      password: encargadoPassword,
      rol: 'ENCARGADO',
      estado: 'ACTIVO',
    },
  })
  console.log('✅ Encargado user created:', encargado.email)

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'usuario@emi.edu' },
    update: {},
    create: {
      nombre: 'Usuario Regular',
      email: 'usuario@emi.edu',
      password: userPassword,
      rol: 'USUARIO',
      estado: 'ACTIVO',
    },
  })
  console.log('✅ Regular user created:', user.email)

  // Create sample assets
  const assets = [
    {
      nombre: 'Laptop Dell Latitude 5420',
      serie: 'DELL-LAT-001',
      categoria: 'Computadoras',
      ubicacion: 'Laboratorio A',
      estado: 'DISPONIBLE' as const,
      responsable_id: encargado.id,
    },
    {
      nombre: 'Proyector Epson EB-X41',
      serie: 'EPSON-EB-001',
      categoria: 'Equipos Audiovisuales',
      ubicacion: 'Aula 101',
      estado: 'DISPONIBLE' as const,
    },
    {
      nombre: 'Impresora HP LaserJet',
      serie: 'HP-LJ-001',
      categoria: 'Impresoras',
      ubicacion: 'Oficina Administrativa',
      estado: 'DISPONIBLE' as const,
    },
    {
      nombre: 'Router Cisco RV340',
      serie: 'CISCO-RV-001',
      categoria: 'Equipos de Red',
      ubicacion: 'Sala de Servidores',
      estado: 'DISPONIBLE' as const,
      responsable_id: admin.id,
    },
    {
      nombre: 'Monitor LG 24"',
      serie: 'LG-MON-001',
      categoria: 'Monitores',
      ubicacion: 'Laboratorio B',
      estado: 'REPARACION' as const,
    },
  ]

  for (const asset of assets) {
    const created = await prisma.asset.upsert({
      where: { serie: asset.serie },
      update: {},
      create: asset,
    })
    console.log('✅ Asset created:', created.nombre)

    // Create log entry
    await prisma.log_Movimiento.create({
      data: {
        asset_id: created.id,
        usuario_id: admin.id,
        estado_nuevo: created.estado,
        descripcion: `Activo creado durante seed inicial: ${created.nombre}`,
      },
    })
  }

  console.log('🎉 Seed completed successfully!')
  console.log('\n📝 Default users created:')
  console.log('   Admin: admin@emi.edu / admin123')
  console.log('   Encargado: encargado@emi.edu / encargado123')
  console.log('   Usuario: usuario@emi.edu / user123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
