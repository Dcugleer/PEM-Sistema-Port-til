'use client'

import { ReactNode } from 'react'
import { UserMenu } from '@/components/user-menu'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col">
        {/* Header */}
        <header className="border-b bg-background">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-foreground">
                🛡️ Área Administrativa
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Admin: {localStorage.getItem('userName') || 'Administrador'}</span>
                <UserMenu />
              </div>
            </div>
          </header>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}