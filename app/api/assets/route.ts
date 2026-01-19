import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/assets - List assets with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const estado = searchParams.get("estado") || ""

    const skip = (page - 1) * limit

    // Build where clause for search
    const where: any = {}
    
    if (search) {
      where.OR = [
        { nombre: { contains: search } },
        { serie: { contains: search } },
        { ubicacion: { contains: search } },
        { categoria: { contains: search } }
      ]
    }

    if (estado) {
      where.estado = estado
    }

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        include: {
          responsable: {
            select: {
              id: true,
              nombre: true,
              email: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      prisma.asset.count({ where })
    ])

    return NextResponse.json({
      assets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching assets:", error)
    return NextResponse.json(
      { error: "Error al obtener activos" },
      { status: 500 }
    )
  }
}

// POST /api/assets - Create new asset
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role === "USUARIO") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { nombre, serie, categoria, ubicacion, responsable_id } = body

    // Check if serie already exists
    const existingAsset = await prisma.asset.findUnique({
      where: { serie }
    })

    if (existingAsset) {
      return NextResponse.json(
        { error: "El número de serie ya existe" },
        { status: 400 }
      )
    }

    const asset = await prisma.asset.create({
      data: {
        nombre,
        serie,
        categoria,
        ubicacion,
        responsable_id: responsable_id || null
      },
      include: {
        responsable: true
      }
    })

    // Create log entry
    await prisma.log_Movimiento.create({
      data: {
        asset_id: asset.id,
        usuario_id: parseInt((session.user as any).id),
        estado_nuevo: asset.estado,
        descripcion: `Activo creado: ${asset.nombre}`
      }
    })

    return NextResponse.json(asset, { status: 201 })
  } catch (error) {
    console.error("Error creating asset:", error)
    return NextResponse.json(
      { error: "Error al crear activo" },
      { status: 500 }
    )
  }
}
