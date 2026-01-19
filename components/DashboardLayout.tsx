'use client'

import { ReactNode } from 'react'
import { 
  LayoutDashboard, 
  Package, 
  Ticket, 
  Users, 
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { data: session } = useSession()
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Activos', href: '/dashboard/assets', icon: Package },
    { name: 'Tickets', href: '/dashboard/tickets', icon: Ticket },
    { name: 'Usuarios', href: '/dashboard/users', icon: Users, adminOnly: true },
  ]

  const filteredNavigation = navigation.filter(
    item => !item.adminOnly || (session?.user as any)?.role === 'ADMIN'
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-gray-900 w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 bg-gray-800">
            <h1 className="text-xl font-bold text-white">Inventario EMI</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {filteredNavigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-800 p-4">
            <div className="flex items-center mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-gray-400">
                  {(session?.user as any)?.role}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`${sidebarOpen ? 'lg:ml-64' : ''}`}>
        {/* Top bar */}
        <header className="bg-white shadow-sm h-16 flex items-center px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
