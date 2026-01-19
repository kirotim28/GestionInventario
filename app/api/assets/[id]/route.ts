import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PATCH /api/assets/[id] - Update asset status
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const params = await context.params
    const id = parseInt(params.id, 10)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de activo inválido" },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    const { estado, responsable_id } = body

    const asset = await prisma.asset.findUnique({
      where: { id }
    })

    if (!asset) {
      return NextResponse.json(
        { error: "Activo no encontrado" },
        { status: 404 }
      )
    }

    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: {
        estado: estado || asset.estado,
        responsable_id: responsable_id !== undefined ? responsable_id : asset.responsable_id
      },
      include: {
        responsable: true
      }
    })

    // Create log entry
    await prisma.log_Movimiento.create({
      data: {
        asset_id: id,
        usuario_id: parseInt((session.user as any).id),
        estado_anterior: asset.estado,
        estado_nuevo: updatedAsset.estado,
        responsable_anterior_id: asset.responsable_id,
        responsable_nuevo_id: updatedAsset.responsable_id,
        descripcion: `Estado cambiado de ${asset.estado} a ${updatedAsset.estado}`
      }
    })

    return NextResponse.json(updatedAsset)
  } catch (error) {
    console.error("Error updating asset:", error)
    return NextResponse.json(
      { error: "Error al actualizar activo" },
      { status: 500 }
    )
  }
}

// DELETE /api/assets/[id] - Delete asset
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const params = await context.params
    const id = parseInt(params.id, 10)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de activo inválido" },
        { status: 400 }
      )
    }

    await prisma.asset.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Activo eliminado" })
  } catch (error) {
    console.error("Error deleting asset:", error)
    return NextResponse.json(
      { error: "Error al eliminar activo" },
      { status: 500 }
    )
  }
}
