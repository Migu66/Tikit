import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

// Crear middleware de i18n
const intlMiddleware = createMiddleware(routing)

// Rutas protegidas que requieren autenticación
const protectedRoutes = ['/dashboard', '/tickets', '/stats', '/profile']

// Rutas de autenticación (no accesibles si ya estás autenticado)
const authRoutes = ['/login', '/register']

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Primero, aplicar middleware de internacionalización
    const response = intlMiddleware(request)

    // Obtener el token de autenticación
    const token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
        secureCookie: process.env.NODE_ENV === 'production',
    })

    // Extraer la ruta sin el locale
    const pathnameWithoutLocale = pathname.replace(/^\/(es|en)/, '') || '/'

    // Verificar si la ruta es protegida
    const isProtectedRoute = protectedRoutes.some((route) =>
        pathnameWithoutLocale.startsWith(route)
    )

    // Verificar si es una ruta de autenticación
    const isAuthRoute = authRoutes.some((route) =>
        pathnameWithoutLocale.startsWith(route)
    )

    // Si es una ruta protegida y no hay token, redirigir a login
    if (isProtectedRoute && !token) {
        const locale = pathname.split('/')[1] || 'es'
        return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
    }

    // Si es una ruta de autenticación y hay token, redirigir a dashboard
    if (isAuthRoute && token) {
        const locale = pathname.split('/')[1] || 'es'
        return NextResponse.redirect(
            new URL(`/${locale}/dashboard`, request.url)
        )
    }

    return response
}

export const config = {
    // Matcher para todas las rutas excepto API, _next/static, _next/image, favicon
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
