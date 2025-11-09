import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production')

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET)
        
        // Criar log de auditoria
        await db.auditLog.create({
          data: {
            userId: payload.userId as string,
            action: 'LOGOUT',
            entity: 'auth',
            ipAddress: request.ip || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
          }
        })
      } catch (error) {
        // Token inválido, mas continuar com logout
        console.log('Token inválido durante logout:', error)
      }
    }

    // Limpar cookie
    const response = NextResponse.json({ success: true })
    response.cookies.delete('auth-token')

    return response
  } catch (error) {
    console.error('Erro no logout:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}