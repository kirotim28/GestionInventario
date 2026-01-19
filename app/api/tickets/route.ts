import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/tickets - Create ticket and update asset status
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { activo_id, descripcion, tipo } = body

    // Verify asset exists
    const asset = await prisma.asset.findUnique({
      where: { id: activo_id }
    })

    if (!asset) {
      return NextResponse.json(
        { error: "Activo no encontrado" },
        { status: 404 }
      )
    }

    // Create ticket
    const ticket = await prisma.ticket_Soporte.create({
      data: {
        activo_id,
        usuario_id: parseInt((session.user as any).id),
        descripcion,
        tipo
      },
      include: {
        activo: true,
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        }
      }
    })

    // Automatically change asset status to EN_REVISION for FALLA type
    if (tipo === "FALLA") {
      await prisma.asset.update({
        where: { id: activo_id },
        data: { estado: "EN_REVISION" }
      })

      // Create log entry
      await prisma.log_Movimiento.create({
        data: {
          asset_id: activo_id,
          usuario_id: parseInt((session.user as any).id),
          estado_anterior: asset.estado,
          estado_nuevo: "EN_REVISION",
          descripcion: `Ticket de falla creado - Estado cambiado a EN_REVISION`
        }
      })
    }

    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    console.error("Error creating ticket:", error)
    return NextResponse.json(
      { error: "Error al crear ticket" },
      { status: 500 }
    )
  }
}

// GET /api/tickets - List tickets
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    const skip = (page - 1) * limit

    const [tickets, total] = await Promise.all([
      prisma.ticket_Soporte.findMany({
        include: {
          activo: true,
          usuario: {
            select: {
              id: true,
              nombre: true,
              email: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { fecha: "desc" }
      }),
      prisma.ticket_Soporte.count()
    ])

    return NextResponse.json({
      tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching tickets:", error)
    return NextResponse.json(
      { error: "Error al obtener tickets" },
      { status: 500 }
    )
  }
}
