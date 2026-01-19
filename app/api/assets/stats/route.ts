import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/assets/stats - Get asset statistics
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const [disponible, reservado, reparacion, baja, en_revision, total] = await Promise.all([
      prisma.asset.count({ where: { estado: "DISPONIBLE" } }),
      prisma.asset.count({ where: { estado: "RESERVADO" } }),
      prisma.asset.count({ where: { estado: "REPARACION" } }),
      prisma.asset.count({ where: { estado: "BAJA" } }),
      prisma.asset.count({ where: { estado: "EN_REVISION" } }),
      prisma.asset.count()
    ])

    return NextResponse.json({
      disponible,
      reservado,
      reparacion,
      baja,
      en_revision,
      total
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    )
  }
}
