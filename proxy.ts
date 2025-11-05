import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Coincidir con todas las rutas excepto las que empiecen con api, _next, o archivos estáticos
  matcher: ['/', '/(es|en)/:path*']
};
