'use client'

import { useState } from 'react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { User, LogOut, Settings, Users } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

export function UserMenu() {
  const { user, logout, hasPermission } = useAuth()

  if (!user) return null

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrador'
      case 'OPERATOR': return 'Operador'
      case 'VIEWER': return 'Visualizador'
      default: return role
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">{user.name}</span>
          <Badge variant="secondary" className={`${getRoleColor(user.role)} text-white text-xs`}>
            {getRoleLabel(user.role)}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">{user.name}</p>
          <p className="text-xs leading-none text-muted-foreground">
            {user.username}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {hasPermission('manage_users') && (
          <DropdownMenuItem onClick={() => window.location = '/users'}>
            <Users className="mr-2 h-4" />
            <span>Gerenciar Usuários</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem>
          <Shield className="mr-2 h-4" />
          <span>Meu Perfil</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem>
          <DropdownMenuItem onClick={() => window.location = '/profile'}>
            <Settings className="mr-2 h-4" />
            <span>Configurações</span>
          </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}