import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

// Crear middleware de i18n
const intlMiddleware = createMiddleware(routing)

// Rutas protegidas que requieren autenticación
const protectedRoutes = ['/dashboard', '/tickets', '/stats', '/profile']

// Rutas de autenticación (no accesibles si ya estás autenticado)
const authRoutes = ['/login', '/register']

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Verificar si existe la cookie de sesión de NextAuth
    const sessionToken =
        request.cookies.get('next-auth.session-token')?.value ||
        request.cookies.get('__Secure-next-auth.session-token')?.value

    const hasSession = !!sessionToken

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

    // Si es una ruta protegida y no hay sesión, redirigir a login
    if (isProtectedRoute && !hasSession) {
        const locale = pathname.split('/')[1] || 'es'
        return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
    }

    // Si es una ruta de autenticación y hay sesión, redirigir a dashboard
    if (isAuthRoute && hasSession) {
        const locale = pathname.split('/')[1] || 'es'
        return NextResponse.redirect(
            new URL(`/${locale}/dashboard`, request.url)
        )
    }

    // Aplicar middleware de internacionalización
    return intlMiddleware(request)
}

export const config = {
    // Matcher para todas las rutas excepto API, _next/static, _next/image, favicon
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
