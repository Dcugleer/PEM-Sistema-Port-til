'use client'

import { useState, useEffect } from 'react'
import { UserManagement } from '@/components/user-management'
import { ProtectedRoute } from '@/components/protected-route'
import { Button } from '@/components/ui/button'
import { Users, Settings } from 'lucide-react'

export default function UsersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  return (
    <ProtectedRoute requiredPermission="manage_users">
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">👥 Gerenciamento de Usuários</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie todos os usuários do sistema PEM
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <Button onClick={openModal}>
                <Users className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Novo Usuário</span>
              </Button>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Configurações</span>
              </Button>
            </div>
          </div>

          {/* User Management Modal */}
          <UserManagement
            isOpen={isModalOpen}
            onClose={closeModal}
            onUserUpdated={() => {
              // Atualizar a lista de usuários após qualquer alteração
            }}
          />
        </div>
      </div>
    </ProtectedRoute>
  )
}