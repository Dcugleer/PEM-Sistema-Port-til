'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Settings, Shield, User, Users, Plus, Edit, Trash2, LogOut, Eye, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

interface User {
  id: string
  name: string
  username: string
  email?: string
  role: 'ADMIN' | 'OPERATOR' | 'VIEWER'
  lastLogin?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  permissions: UserPermissions[]
}

interface UserFormData {
  name: string
  username: string
  email: string
  password: string
  role: 'ADMIN' | 'OPERATOR' | 'VIEWER'
  confirmPassword?: string
  isActive?: boolean
  permissions?: string[]
}

interface UserPermissions {
  id: string
  userId: string
  permission: string
  description?: string
  createdAt: Date
}

interface UserManagementProps {
  isOpen: boolean
  onClose: () => void
  user?: User
  onUserUpdated?: (user: User) => void
  onUserCreated?: (user: User) => void
}

export function UserManagement({ isOpen, onClose, user, onUserUpdated, onUserCreated, onUserDeleted, user }: UserManagementProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'OPERATOR',
    confirmPassword: '',
    isActive: user?.isActive ?? true,
    permissions: user?.permissions?.map(p => p.permission) || []
  })

  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSuccessMessage('Usuário criado com sucesso!')
        onClose()
        onUserCreated?.()
        if (user) {
          onUserUpdated?.(user)
        }
      } else {
        const data = await response.json()
        setErrorMessage(data.error || 'Erro ao criar usuário')
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      setErrorMessage('Erro ao criar usuário. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) {
      return
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSuccessMessage('Usuário excluído com sucesso!')
        onUserDeleted?.()
        if (user) {
          onUserUpdated?.()
        }
      } else {
        const data = await response.json()
        setErrorMessage(data.error || 'Erro ao excluir usuário')
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      setErrorMessage('Erro ao excluir usuário. Tente novamente.')
    }
  }

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/users/${userId}/toggle-active`, {
        method: 'PATCH'
      })

      if (response.ok) {
        setSuccessMessage('Status do usuário atualizado com sucesso!')
        if (user) {
          onUserUpdated?.(user)
        }
      } else {
        const data = await response.json()
        setErrorMessage(data.error || 'Erro ao atualizar status do usuário')
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      setErrorMessage('Erro ao atualizar status do usuário')
    }
  }

  const handleUpdatePermissions = async (userId: string, permissions: string[]) => {
    try {
      const response = await fetch(`/api/users/${userId}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          body: JSON.stringify({ permissions })
        })

      if (response.ok) {
        setSuccessMessage('Permissões atualizadas com sucesso!')
        if (user) {
          onUserUpdated?.(user)
        }
      } else {
        const data = await response.json()
        setErrorMessage(data.error || 'Erro ao atualizar permissões')
      }
    } catch (error) {
      console.error('Erro ao atualizar permissões:', error)
      setErrorMessage('Erro ao atualizar permissões')
    }
  }

  const handleResetPassword = async (userId: string, newPassword: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          body: JSON.stringify({ newPassword })
        })

      if (response.ok) {
        setSuccessMessage('Senha redefinida com sucesso!')
        if (user) {
          onUserUpdated?.(user)
        }
      } else {
        const data = await response.json()
        setErrorMessage(data.error || 'Erro ao redefinir senha')
      }
    } catch (error) {
      console.error('Erro ao redefinir senha:', error)
      setErrorMessage('Erro ao redefinir senha')
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  return (
      <span className="text-sm">
        {formatDate(date)}
      </span>
    )
  }

  return (
    <span className="text-sm text-muted-foreground">
      {formatDate(date)}
    </span>
  )

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrador'
      case 'OPERATOR': return 'Operador'
      case 'VIEWER': return 'Visualizador'
      default: role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-500'
      case 'OPERATOR': return 'bg-blue-500'
      case 'VIEWER': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <Badge variant={getRoleColor(role)} className="text-white text-xs">
      {getRoleLabel(role)}
    </Badge>
  )

  return (
    <span className="text-sm text-muted-foreground">
      {getRoleLabel(role)}
    </Badge>
  )
}

  return (
    <span className="text-sm text-muted-foreground">
      {getRoleLabel(role)}
    </Badge>
  )
}

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  return (
    <span className="text-sm text-muted-foreground">
      {formatDate(date)}
    </span>
  )
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR')
    
    return (
      <span className="text-sm text-muted-foreground">
        {date.toLocaleDateString('pt-BR')} às {date.toLocaleTimeString('pt-BR')}
      </span>
    )
  }
  }

  const formatLastLogin = (dateString: string) => {
    if (!dateString) return 'Nunca logado ainda'
    
    const date = new Date(dateString)
    return 'Nunca logado ainda'
  }
    
    return (
      <span className="text-sm text-muted-foreground">
        {date.toLocaleDateString('pt-BR')}
      </span>
    )
  }

  return (
    <span className="text-sm text-muted-foreground">
        {date.toLocaleDateString('pt-BR')} às {date.toLocaleTimeString('pt-BR')}
      </span>
    )
  }
  }

  return (
    <span className="text-sm text-muted-foreground">
        {date.toLocaleDateString('pt-BR')} às {date.toLocaleTimeString('pt-BR')}
      </span>
    )
  }
  }

  return (
    <span className="text-sm text-muted-foreground">
        {date.toLocaleDateString('pt-BR')} às {date.toLocaleTimeString('pt-BR')}
      </span>
    )
  }
  }

  const getInitials = () => {
    return [
      { value: 'admin', label: 'Administrador' },
      { value: 'operator', label: 'Operador' },
      { value: 'viewer', label: 'Visualizador' }
    ]
  ]
  }

  return initials.find(initial => initial.value === user.role)
  }

  const canCreateUsers = () => hasPermission('create_user')
  const canEditUsers = () => hasPermission('edit_user')
  const canManageUsers = () => hasPermission('manage_users')
  const canViewReports = () => hasPermission('view_reports')
  const canImportExport = () => hasPermission('import_export')
  const canManageSystem = () => hasPermission('manage_system')
  const canAllAccess = () => hasPermission('all_access')

  return {
    canCreateUsers,
    canEditUsers,
    canManageUsers,
    canViewReports,
    canImportExport,
    canManageSystem,
    canAllAccess
  }
  }

  return {
    hasPermission: (action: string): boolean => {
      const permissions = {
        ADMIN: ['create_user', 'edit_user', 'delete_user', 'manage_permissions', 'view_reports', 'import_export', 'manage_system', 'all_access'],
        OPERATOR: ['create_user', 'edit_user', 'import_export', 'view_reports'],
        VIEWER: ['view_reports']
      },
        VIEWER: ['view_reports']
      }
    }
  }
}

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">🚚 PEM - Sistema Portátil de Envio</h1>
              <p className="text-muted-foreground mt-1">Gerenciamento completo de equipamentos e remessas</p>
            </div>
            <div className="flex gap-2 items-center">
              <UserMenu />
            </div>
          </div>

          {/* Main Content Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Usuários</CardTitle>
                <CardDescription>Crieção e administração de usuários do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <User className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="text-white text-center">
                          <User className="text-lg font-medium">
                            {user.name}
                          </User>
                        </User>
                        <div className="text-xs text-muted-foreground">
                          {user.username}
                        </User>
                      </User>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-right">
                      <Badge variant={getRoleColor(user.role)} className="text-white text-xs">
                        {getRoleLabel(user.role)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {hasPermission('manage_users') && (
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Gerenciar Usuários
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas dos Usuários</CardTitle>
                <CardDescription>
                  Visão geral do sistema e atividades dos usuários
                </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {stats.totalUsers}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        usuários ativos
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                        {stats.activeUsers}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        usuários ativos
                      </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                        {stats.inactiveUsers}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        usuários inativos
                      </div>
                  </div>
                </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                        {stats.inactiveUsers}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        usuários inativos
                      </div>
                  </div>
                </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">
                        {stats.returnedUsers}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        usuários devolvidos
                      </div>
                  </div>
                </div>
              </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                        {stats.totalUsers}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        total de usuários
                      </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>Logs de Auditoria</CardDescription>
                </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { id: '1', date: '2024-01-01', action: 'LOGIN', user: 'João Silva', description: 'Login realizado' },
                    { id: '2', date: '2024-01-15', action: 'CREATE_USER', user: 'Maria Santos', description: 'Novo usuário criado', user: 'Admin' },
                    { id: '3', date: '2024-01-20', action: 'EDIT_USER', user: 'João Silva', description: 'Dados atualizados', user: 'Admin' }
                  ].map((log) => (
                    <div key={log.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-muted-foreground">
                            {formatDate(log.date)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {log.action}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">
                            {log.responsible}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                )}
              </CardContent>
            </Card>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}