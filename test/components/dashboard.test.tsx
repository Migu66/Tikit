import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { StatsOverview } from '@/components/dashboard/stats-overview'
import { LanguageSelector } from '@/components/ui/language-selector'

// Mock de next-intl
const mockUseTranslations = vi.fn(
    (namespace: string) => (key: string) => `${namespace}.${key}`
)
const mockUseLocale = vi.fn(() => 'es')

vi.mock('next-intl', () => ({
    useTranslations: (namespace: string) => (key: string) =>
        `${namespace}.${key}`,
    useLocale: () => 'es',
}))

// Mock de next/navigation
const mockPush = vi.fn()
const mockUsePathname = vi.fn(() => '/es/dashboard')

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
    usePathname: () => mockUsePathname(),
}))

describe('Componentes React', () => {
    describe('StatsOverview', () => {
        it('debería renderizar las estadísticas correctamente', () => {
            // Arrange
            const props = {
                totalSpent: 1234.56,
                ticketsCount: 10,
                monthTicketsCount: 5,
                averagePerTicket: 246.91,
            }

            // Act
            render(<StatsOverview {...props} />)

            // Assert
            expect(screen.getByText('€1234.56')).toBeInTheDocument()
            expect(screen.getByText('5')).toBeInTheDocument()
            expect(screen.getByText('€246.91')).toBeInTheDocument()
        })

        it('debería renderizar con valores en cero', () => {
            // Arrange
            const props = {
                totalSpent: 0,
                ticketsCount: 0,
                monthTicketsCount: 0,
                averagePerTicket: 0,
            }

            // Act
            render(<StatsOverview {...props} />)

            // Assert
            const zeroValues = screen.getAllByText('€0.00')
            expect(zeroValues.length).toBeGreaterThanOrEqual(2)
            expect(screen.getByText('0')).toBeInTheDocument()
        })

        it('debería mostrar 3 tarjetas de estadísticas', () => {
            // Arrange
            const props = {
                totalSpent: 100,
                ticketsCount: 10,
                monthTicketsCount: 5,
                averagePerTicket: 20,
            }

            // Act
            const { container } = render(<StatsOverview {...props} />)

            // Assert
            const cards = container.querySelectorAll('.bg-white.rounded-lg')
            expect(cards).toHaveLength(3)
        })

        it('debería formatear correctamente los decimales', () => {
            // Arrange
            const props = {
                totalSpent: 1234.567,
                ticketsCount: 10,
                monthTicketsCount: 5,
                averagePerTicket: 246.913,
            }

            // Act
            render(<StatsOverview {...props} />)

            // Assert
            expect(screen.getByText('€1234.57')).toBeInTheDocument() // Redondeado a 2 decimales
            expect(screen.getByText('€246.91')).toBeInTheDocument()
        })

        it('debería aplicar las clases de estilo correctas', () => {
            // Arrange
            const props = {
                totalSpent: 100,
                ticketsCount: 10,
                monthTicketsCount: 5,
                averagePerTicket: 20,
            }

            // Act
            const { container } = render(<StatsOverview {...props} />)

            // Assert
            const card = container.querySelector(
                '.bg-white.rounded-lg.shadow-sm'
            )
            expect(card).toBeInTheDocument()
            expect(card).toHaveClass('hover:shadow-md')
        })

        it('debería renderizar iconos para cada estadística', () => {
            // Arrange
            const props = {
                totalSpent: 100,
                ticketsCount: 10,
                monthTicketsCount: 5,
                averagePerTicket: 20,
            }

            // Act
            const { container } = render(<StatsOverview {...props} />)

            // Assert
            const icons = container.querySelectorAll('svg')
            expect(icons.length).toBeGreaterThanOrEqual(3) // Al menos 3 iconos
        })

        it('debería usar las traducciones correctamente', () => {
            // Arrange
            const props = {
                totalSpent: 100,
                ticketsCount: 10,
                monthTicketsCount: 5,
                averagePerTicket: 20,
            }

            // Act
            render(<StatsOverview {...props} />)

            // Assert
            expect(
                screen.getByText('dashboard.stats.overview.totalSpent')
            ).toBeInTheDocument()
            expect(
                screen.getByText('dashboard.stats.overview.ticketsCount')
            ).toBeInTheDocument()
            expect(
                screen.getByText('dashboard.stats.overview.averageTicket')
            ).toBeInTheDocument()
        })
    })

    describe('LanguageSelector', () => {
        it('debería renderizar el selector de idioma', () => {
            // Act
            render(<LanguageSelector />)

            // Assert
            const button = screen.getByRole('button', {
                name: /select language/i,
            })
            expect(button).toBeInTheDocument()
        })

        it('debería mostrar el idioma actual (español)', () => {
            // Arrange
            mockUseLocale.mockReturnValue('es')

            // Act
            render(<LanguageSelector />)

            // Assert
            const button = screen.getByTitle('Español')
            expect(button).toBeInTheDocument()
        })

        it('debería abrir el dropdown al hacer clic', async () => {
            // Act
            render(<LanguageSelector />)

            const button = screen.getByRole('button', {
                name: /select language/i,
            })
            fireEvent.click(button)

            // Assert
            await waitFor(() => {
                const dropdownButtons = screen.getAllByRole('button')
                expect(dropdownButtons.length).toBeGreaterThan(1) // Botón principal + opciones
            })
        })

        it('debería cambiar el idioma al seleccionar inglés', async () => {
            // Arrange
            mockUsePathname.mockReturnValue('/es/dashboard')

            // Act
            render(<LanguageSelector />)

            const button = screen.getByRole('button', {
                name: /select language/i,
            })
            fireEvent.click(button)

            await waitFor(() => {
                const englishButton = screen.getByTitle('English')
                fireEvent.click(englishButton)
            })

            // Assert
            expect(mockPush).toHaveBeenCalledWith('/en/dashboard')
        })

        it('debería cerrar el dropdown al hacer clic fuera', async () => {
            // Act
            const { container } = render(<LanguageSelector />)

            const button = screen.getByRole('button', {
                name: /select language/i,
            })
            fireEvent.click(button)

            // Verificar que está abierto
            await waitFor(() => {
                const dropdownButtons = screen.getAllByRole('button')
                expect(dropdownButtons.length).toBeGreaterThan(1)
            })

            // Click fuera del dropdown
            fireEvent.mouseDown(document.body)

            // Assert
            await waitFor(() => {
                const dropdownButtons = screen.getAllByRole('button')
                expect(dropdownButtons.length).toBe(1) // Solo el botón principal
            })
        })

        it('debería resaltar el idioma actual en el dropdown', async () => {
            // Arrange
            mockUseLocale.mockReturnValue('es')

            // Act
            render(<LanguageSelector />)

            const button = screen.getByRole('button', {
                name: /select language/i,
            })
            fireEvent.click(button)

            // Assert
            await waitFor(() => {
                const spanishButtons = screen.getAllByTitle('Español')
                const dropdownButton = spanishButtons.find((btn) =>
                    btn.className.includes('px-3')
                )
                expect(dropdownButton?.className).toContain('bg-gray-100')
            })
        })

        it('debería cambiar correctamente las rutas con diferentes paths', async () => {
            // Arrange
            mockUsePathname.mockReturnValue('/es/dashboard/stats')

            // Act
            render(<LanguageSelector />)

            const button = screen.getByRole('button', {
                name: /select language/i,
            })
            fireEvent.click(button)

            await waitFor(() => {
                const englishButton = screen.getByTitle('English')
                fireEvent.click(englishButton)
            })

            // Assert
            expect(mockPush).toHaveBeenCalledWith('/en/dashboard/stats')
        })

        it('debería cerrar el dropdown después de seleccionar un idioma', async () => {
            // Act
            render(<LanguageSelector />)

            const button = screen.getByRole('button', {
                name: /select language/i,
            })
            fireEvent.click(button)

            await waitFor(() => {
                const englishButton = screen.getByTitle('English')
                fireEvent.click(englishButton)
            })

            // Assert
            await waitFor(() => {
                const dropdownButtons = screen.getAllByRole('button')
                expect(dropdownButtons.length).toBe(1) // Solo el botón principal
            })
        })
    })
})
