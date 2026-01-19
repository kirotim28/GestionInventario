'use client'

import { useState, useEffect } from 'react'
import { Package, AlertCircle, Edit } from 'lucide-react'
import toast from 'react-hot-toast'

interface Asset {
  id: number
  nombre: string
  serie: string
  categoria: string
  ubicacion: string
  estado: string
  responsable?: {
    id: number
    nombre: string
    email: string
  }
}

interface AssetsTableProps {
  searchQuery: string
  statusFilter: string
}

const statusColors: Record<string, string> = {
  DISPONIBLE: 'bg-green-100 text-green-800',
  RESERVADO: 'bg-blue-100 text-blue-800',
  REPARACION: 'bg-yellow-100 text-yellow-800',
  BAJA: 'bg-red-100 text-red-800',
  EN_REVISION: 'bg-purple-100 text-purple-800',
}

const statusLabels: Record<string, string> = {
  DISPONIBLE: 'Disponible',
  RESERVADO: 'Reservado',
  REPARACION: 'En Reparación',
  BAJA: 'De Baja',
  EN_REVISION: 'En Revisión',
}

export default function AssetsTable({ searchQuery, statusFilter }: AssetsTableProps) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchAssets()
  }, [searchQuery, statusFilter, page])

  const fetchAssets = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter && { estado: statusFilter }),
      })

      const response = await fetch(`/api/assets?${params}`)
      if (!response.ok) throw new Error('Error al cargar activos')

      const data = await response.json()
      setAssets(data.assets)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      toast.error('Error al cargar activos')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleReportFailure = async (assetId: number, assetName: string) => {
    const descripcion = prompt(`Reportar falla en: ${assetName}\n\nDescripción de la falla:`)
    
    if (!descripcion) return

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activo_id: assetId,
          descripcion,
          tipo: 'FALLA'
        })
      })

      if (!response.ok) throw new Error('Error al crear ticket')

      toast.success('Falla reportada. El activo está ahora en revisión.')
      fetchAssets()
    } catch (error) {
      toast.error('Error al reportar falla')
      console.error(error)
    }
  }

  const handleRequestLoan = async (assetId: number, assetName: string) => {
    if (!confirm(`¿Desea solicitar el préstamo de: ${assetName}?`)) return

    try {
      const response = await fetch(`/api/assets/${assetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'RESERVADO' })
      })

      if (!response.ok) throw new Error('Error al reservar activo')

      toast.success('Activo reservado exitosamente')
      fetchAssets()
    } catch (error) {
      toast.error('Error al reservar activo')
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsable
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {asset.serie}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {asset.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {asset.categoria}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {asset.ubicacion}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[asset.estado]}`}>
                      {statusLabels[asset.estado]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {asset.responsable?.nombre || 'Sin asignar'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      {asset.estado === 'DISPONIBLE' && (
                        <button
                          onClick={() => handleRequestLoan(asset.id, asset.nombre)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Solicitar Préstamo"
                        >
                          <Package className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleReportFailure(asset.id, asset.nombre)}
                        className="text-orange-600 hover:text-orange-900"
                        title="Reportar Falla"
                      >
                        <AlertCircle className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-700">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}
