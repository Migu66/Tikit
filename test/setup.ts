import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import createFetchMock from 'vitest-fetch-mock'

// Configurar fetch mock
const fetchMock = createFetchMock(vi)
fetchMock.enableMocks()

// Limpiar después de cada test
afterEach(() => {
    cleanup()
    fetchMock.resetMocks()
})

// Mock de variables de entorno
process.env.GROQ_API_KEY = 'test-groq-key'
process.env.OCR_SPACE_API_KEY = 'test-ocr-key'
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud'
process.env.CLOUDINARY_API_KEY = 'test-api-key'
process.env.CLOUDINARY_API_SECRET = 'test-secret'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'

// Mock de Next.js
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        refresh: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        prefetch: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
}))

// Mock de next-intl
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
    useLocale: () => 'es',
}))
