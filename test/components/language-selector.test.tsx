import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LanguageSelector } from '@/components/ui/language-selector'

// Mock de next-intl
vi.mock('next-intl', () => ({
    useLocale: vi.fn(() => 'es'),
}))

// Mock de next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
    usePathname: () => '/es/dashboard',
}))

describe('LanguageSelector', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('debería renderizar el selector con el idioma actual', () => {
        render(<LanguageSelector />)
        const button = screen.getByLabelText('Select language')
        expect(button).toBeDefined()
    })

    it('debería cerrar el dropdown al hacer click fuera', async () => {
        render(
            <div>
                <LanguageSelector />
                <div data-testid="outside">Outside element</div>
            </div>
        )

        const button = screen.getByLabelText('Select language')
        fireEvent.click(button)

        // Verificar que el dropdown está abierto (2 elementos: botón principal + opción en dropdown)
        expect(screen.getAllByTitle('Español').length).toBe(2)

        // Hacer click fuera del dropdown
        const outsideElement = screen.getByTestId('outside')
        fireEvent.mouseDown(outsideElement)

        // Esperar a que se cierre el dropdown
        await waitFor(() => {
            // Las opciones de idioma ya no deberían estar visibles
            const buttons = screen.queryAllByTitle('Español')
            // Solo debería quedar el botón principal (title del selector)
            expect(buttons.length).toBeLessThanOrEqual(1)
        })
    })

    it('debería cerrar el dropdown después de cambiar el idioma', () => {
        render(<LanguageSelector />)

        const button = screen.getByLabelText('Select language')
        fireEvent.click(button)

        // Verificar que está abierto
        expect(screen.getByTitle('English')).toBeDefined()

        // Cambiar idioma
        fireEvent.click(screen.getByTitle('English'))

        // El dropdown debería cerrarse (las opciones ya no están duplicadas)
        const englishButtons = screen.queryAllByTitle('English')
        expect(englishButtons.length).toBeLessThanOrEqual(1)
    })

    it('debería limpiar el event listener al desmontarse', () => {
        const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

        const { unmount } = render(<LanguageSelector />)

        unmount()

        // Verificar que se removió el event listener
        expect(removeEventListenerSpy).toHaveBeenCalledWith(
            'mousedown',
            expect.any(Function)
        )

        removeEventListenerSpy.mockRestore()
    })

    it('no debería cerrar el dropdown al hacer click dentro de él', () => {
        render(<LanguageSelector />)

        const button = screen.getByLabelText('Select language')
        fireEvent.click(button)

        // Click dentro del dropdown (pero no en una opción)
        const dropdown = button.parentElement
        if (dropdown) {
            fireEvent.mouseDown(dropdown)

            // El dropdown debería seguir abierto
            expect(screen.getByTitle('English')).toBeDefined()
        }
    })
})
