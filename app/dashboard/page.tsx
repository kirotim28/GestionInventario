'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import StatCard from '@/components/StatCard'
import SearchBar from '@/components/SearchBar'
import AssetsTable from '@/components/AssetsTable'
import { Package, Wrench, AlertTriangle, XCircle, Eye } from 'lucide-react'

interface Stats {
  disponible: number
  reservado: number
  reparacion: number
  baja: number
  en_revision: number
  total: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    disponible: 0,
    reservado: 0,
    reparacion: 0,
    baja: 0,
    en_revision: 0,
    total: 0
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchStats()
    }
  }, [status])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/assets/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Bienvenido, {session.user?.name}
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Disponibles"
            value={stats.disponible}
            icon={Package}
            color="green"
          />
          <StatCard
            title="En Mantenimiento"
            value={stats.reparacion + stats.en_revision}
            icon={Wrench}
            color="yellow"
          />
          <StatCard
            title="Reservados"
            value={stats.reservado}
            icon={Eye}
            color="blue"
          />
          <StatCard
            title="De Baja"
            value={stats.baja}
            icon={XCircle}
            color="red"
          />
        </div>

        {/* Search and filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchBar onSearch={setSearchQuery} />
            </div>
            <div className="w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los estados</option>
                <option value="DISPONIBLE">Disponible</option>
                <option value="RESERVADO">Reservado</option>
                <option value="REPARACION">En Reparación</option>
                <option value="EN_REVISION">En Revisión</option>
                <option value="BAJA">De Baja</option>
              </select>
            </div>
          </div>
        </div>

        {/* Assets table */}
        <AssetsTable searchQuery={searchQuery} statusFilter={statusFilter} />
      </div>
    </DashboardLayout>
  )
}
