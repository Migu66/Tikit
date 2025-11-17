import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TicketCategory } from '@/types/ticket'

// Mock de Groq SDK
const mockCreate = vi.fn()

vi.mock('groq-sdk', () => {
    return {
        default: class MockGroq {
            chat = {
                completions: {
                    create: mockCreate,
                },
            }
        },
    }
})

// Mock de Prisma
vi.mock('@/lib/prisma', () => ({
    prisma: {
        ticket: {
            findMany: vi.fn(),
        },
        recommendation: {
            deleteMany: vi.fn(),
            createMany: vi.fn(),
        },
    },
}))

// Importar después de los mocks
const { analyzeSpendingPatterns, generateRecommendations } = await import(
    '@/lib/services/recommendations'
)
const { prisma } = await import('@/lib/prisma')

describe('Servicio de Recomendaciones', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockCreate.mockReset()
    })

    describe('analyzeSpendingPatterns', () => {
        it('debería analizar correctamente los patrones de gasto', async () => {
            // Arrange
            const userId = 'test-user-123'
            const now = new Date('2024-11-15')
            vi.setSystemTime(now)

            const mockCurrentMonthTickets = [
                {
                    totalAmount: 50.0,
                    category: 'alimentacion',
                    storeName: 'MERCADONA',
                },
                {
                    totalAmount: 30.0,
                    category: 'alimentacion',
                    storeName: 'MERCADONA',
                },
                {
                    totalAmount: 20.0,
                    category: 'ocio',
                    storeName: 'CINE',
                },
            ]

            const mockPreviousMonthTickets = [
                {
                    totalAmount: 60.0,
                    category: 'alimentacion',
                },
                {
                    totalAmount: 10.0,
                    category: 'ocio',
                },
            ]

            ;(prisma.ticket.findMany as any)
                .mockResolvedValueOnce(mockCurrentMonthTickets)
                .mockResolvedValueOnce(mockPreviousMonthTickets)

            // Act
            const result = await analyzeSpendingPatterns(userId)

            // Assert
            expect(result.currentMonth.total).toBe(100)
            expect(result.currentMonth.byCategory['alimentacion']).toBe(80)
            expect(result.currentMonth.byCategory['ocio']).toBe(20)
            expect(result.previousMonth.total).toBe(70)
            expect(result.changes.totalChange).toBe(30)
            expect(result.changes.totalChangePercentage).toBeCloseTo(42.86, 1)
            expect(result.currentMonth.topStores).toHaveLength(2)
            expect(result.currentMonth.topStores[0].store).toBe('MERCADONA')
            expect(result.currentMonth.topStores[0].visits).toBe(2)

            vi.useRealTimers()
        })

        it('debería manejar tickets sin categoría asignándolos a "otros"', async () => {
            // Arrange
            const userId = 'test-user-123'

            const mockCurrentMonthTickets = [
                {
                    totalAmount: 50.0,
                    category: null,
                    storeName: 'TIENDA',
                },
            ]

            ;(prisma.ticket.findMany as any)
                .mockResolvedValueOnce(mockCurrentMonthTickets)
                .mockResolvedValueOnce([])

            // Act
            const result = await analyzeSpendingPatterns(userId)

            // Assert
            expect(result.currentMonth.byCategory['otros']).toBe(50)
        })

        it('debería calcular correctamente los cambios por categoría', async () => {
            // Arrange
            const userId = 'test-user-123'

            const mockCurrentMonthTickets = [
                {
                    totalAmount: 100.0,
                    category: 'alimentacion',
                    storeName: 'TIENDA',
                },
            ]

            const mockPreviousMonthTickets = [
                {
                    totalAmount: 50.0,
                    category: 'alimentacion',
                },
            ]

            ;(prisma.ticket.findMany as any)
                .mockResolvedValueOnce(mockCurrentMonthTickets)
                .mockResolvedValueOnce(mockPreviousMonthTickets)

            // Act
            const result = await analyzeSpendingPatterns(userId)

            // Assert
            const alimentacionChange = result.changes.categoryChanges.find(
                (c) => c.category === 'alimentacion'
            )
            expect(alimentacionChange).toBeDefined()
            expect(alimentacionChange?.currentAmount).toBe(100)
            expect(alimentacionChange?.previousAmount).toBe(50)
            expect(alimentacionChange?.change).toBe(50)
            expect(alimentacionChange?.changePercentage).toBe(100)
        })

        it('debería ordenar comercios por monto total gastado', async () => {
            // Arrange
            const userId = 'test-user-123'

            const mockCurrentMonthTickets = [
                {
                    totalAmount: 100.0,
                    category: 'alimentacion',
                    storeName: 'TIENDA_A',
                },
                {
                    totalAmount: 200.0,
                    category: 'alimentacion',
                    storeName: 'TIENDA_B',
                },
                {
                    totalAmount: 50.0,
                    category: 'alimentacion',
                    storeName: 'TIENDA_C',
                },
                {
                    totalAmount: 150.0,
                    category: 'alimentacion',
                    storeName: 'TIENDA_B',
                },
            ]

            ;(prisma.ticket.findMany as any)
                .mockResolvedValueOnce(mockCurrentMonthTickets)
                .mockResolvedValueOnce([])

            // Act
            const result = await analyzeSpendingPatterns(userId)

            // Assert
            expect(result.currentMonth.topStores[0].store).toBe('TIENDA_B')
            expect(result.currentMonth.topStores[0].amount).toBe(350)
            expect(result.currentMonth.topStores[0].visits).toBe(2)
        })

        it('debería limitar top comercios a 5', async () => {
            // Arrange
            const userId = 'test-user-123'

            const mockCurrentMonthTickets = Array.from(
                { length: 10 },
                (_, i) => ({
                    totalAmount: 10 * (i + 1),
                    category: 'alimentacion',
                    storeName: `TIENDA_${i}`,
                })
            )

            ;(prisma.ticket.findMany as any)
                .mockResolvedValueOnce(mockCurrentMonthTickets)
                .mockResolvedValueOnce([])

            // Act
            const result = await analyzeSpendingPatterns(userId)

            // Assert
            expect(result.currentMonth.topStores).toHaveLength(5)
        })

        it('debería manejar meses sin tickets', async () => {
            // Arrange
            const userId = 'test-user-123'

            ;(prisma.ticket.findMany as any)
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([])

            // Act
            const result = await analyzeSpendingPatterns(userId)

            // Assert
            expect(result.currentMonth.total).toBe(0)
            expect(result.previousMonth.total).toBe(0)
            expect(result.changes.totalChange).toBe(0)
            expect(result.changes.totalChangePercentage).toBe(0)
            expect(result.currentMonth.topStores).toHaveLength(0)
        })
    })

    describe('generateRecommendations', () => {
        it('debería generar recomendaciones con IA cuando está configurada', async () => {
            // Arrange
            const userId = 'test-user-123'
            const analysis = {
                currentMonth: {
                    total: 500,
                    byCategory: { alimentacion: 300, ocio: 200 },
                    topStores: [{ store: 'MERCADONA', amount: 300, visits: 5 }],
                },
                previousMonth: {
                    total: 400,
                    byCategory: { alimentacion: 250, ocio: 150 },
                },
                changes: {
                    totalChange: 100,
                    totalChangePercentage: 25,
                    categoryChanges: [
                        {
                            category: 'alimentacion',
                            currentAmount: 300,
                            previousAmount: 250,
                            change: 50,
                            changePercentage: 20,
                        },
                    ],
                },
            }

            const mockAIResponse = {
                choices: [
                    {
                        message: {
                            content: JSON.stringify([
                                {
                                    type: 'category_increase',
                                    category: 'alimentacion',
                                    message:
                                        'Tu gasto en alimentación aumentó este mes',
                                    severity: 'warning',
                                    percentage: 20,
                                },
                                {
                                    type: 'monthly_comparison',
                                    message: 'Este mes gastaste 25% más',
                                    severity: 'warning',
                                    percentage: 25,
                                },
                            ]),
                        },
                    },
                ],
            }

            mockCreate.mockResolvedValue(mockAIResponse)

            // Act
            const result = await generateRecommendations(userId, analysis)

            // Assert
            // La función puede complementar con recomendaciones básicas adicionales
            expect(result.length).toBeGreaterThanOrEqual(2)

            // Verificar que contiene las recomendaciones específicas de IA
            const categoryIncrease = result.find(
                (r) =>
                    r.type === 'category_increase' &&
                    r.category === 'alimentacion'
            )
            expect(categoryIncrease).toBeDefined()
            expect(categoryIncrease?.message).toContain('alimentación')

            const monthlyComparison = result.find(
                (r) => r.type === 'monthly_comparison'
            )
            expect(monthlyComparison).toBeDefined()
        })

        it('debería generar recomendaciones básicas cuando no hay API key', async () => {
            // Arrange
            const userId = 'test-user-123'
            const originalKey = process.env.GROQ_API_KEY
            delete process.env.GROQ_API_KEY

            const analysis = {
                currentMonth: {
                    total: 500,
                    byCategory: { alimentacion: 300 },
                    topStores: [{ store: 'MERCADONA', amount: 300, visits: 5 }],
                },
                previousMonth: {
                    total: 400,
                    byCategory: { alimentacion: 250 },
                },
                changes: {
                    totalChange: 100,
                    totalChangePercentage: 25,
                    categoryChanges: [
                        {
                            category: 'alimentacion',
                            currentAmount: 300,
                            previousAmount: 250,
                            change: 50,
                            changePercentage: 20,
                        },
                    ],
                },
            }

            // Act
            const result = await generateRecommendations(userId, analysis)

            // Assert
            expect(result.length).toBeGreaterThan(0)
            expect(result.some((r) => r.type === 'monthly_comparison')).toBe(
                true
            )

            // Restore
            process.env.GROQ_API_KEY = originalKey
        })

        it('debería generar recomendación de aumento mensual', async () => {
            // Arrange
            const userId = 'test-user-123'
            delete process.env.GROQ_API_KEY

            const analysis = {
                currentMonth: {
                    total: 600,
                    byCategory: {},
                    topStores: [],
                },
                previousMonth: {
                    total: 500,
                    byCategory: {},
                },
                changes: {
                    totalChange: 100,
                    totalChangePercentage: 20,
                    categoryChanges: [],
                },
            }

            // Act
            const result = await generateRecommendations(userId, analysis)

            // Assert
            const monthlyRec = result.find(
                (r) => r.type === 'monthly_comparison'
            )
            expect(monthlyRec).toBeDefined()
            expect(monthlyRec?.severity).toBe('warning')
            expect(monthlyRec?.percentage).toBe(20)
        })

        it('debería generar recomendación de reducción mensual', async () => {
            // Arrange
            const userId = 'test-user-123'
            delete process.env.GROQ_API_KEY

            const analysis = {
                currentMonth: {
                    total: 400,
                    byCategory: {},
                    topStores: [],
                },
                previousMonth: {
                    total: 500,
                    byCategory: {},
                },
                changes: {
                    totalChange: -100,
                    totalChangePercentage: -20,
                    categoryChanges: [],
                },
            }

            // Act
            const result = await generateRecommendations(userId, analysis)

            // Assert
            const monthlyRec = result.find(
                (r) => r.type === 'monthly_comparison'
            )
            expect(monthlyRec).toBeDefined()
            expect(monthlyRec?.severity).toBe('success')
            expect(monthlyRec?.message).toContain('menos')
        })

        it('debería generar recomendaciones de aumento por categoría', async () => {
            // Arrange
            const userId = 'test-user-123'
            delete process.env.GROQ_API_KEY

            const analysis = {
                currentMonth: {
                    total: 500,
                    byCategory: { ocio: 200 },
                    topStores: [],
                },
                previousMonth: {
                    total: 400,
                    byCategory: { ocio: 100 },
                },
                changes: {
                    totalChange: 100,
                    totalChangePercentage: 25,
                    categoryChanges: [
                        {
                            category: 'ocio',
                            currentAmount: 200,
                            previousAmount: 100,
                            change: 100,
                            changePercentage: 100,
                        },
                    ],
                },
            }

            // Act
            const result = await generateRecommendations(userId, analysis)

            // Assert
            const categoryRec = result.find(
                (r) => r.type === 'category_increase' && r.category === 'ocio'
            )
            expect(categoryRec).toBeDefined()
            expect(categoryRec?.severity).toBe('warning')
            expect(categoryRec?.message).toContain('ocio')
            expect(categoryRec?.message).toContain('aumentó')
        })

        it('debería generar recomendaciones de reducción por categoría', async () => {
            // Arrange
            const userId = 'test-user-123'
            delete process.env.GROQ_API_KEY

            const analysis = {
                currentMonth: {
                    total: 400,
                    byCategory: { transporte: 50 },
                    topStores: [],
                },
                previousMonth: {
                    total: 500,
                    byCategory: { transporte: 100 },
                },
                changes: {
                    totalChange: -100,
                    totalChangePercentage: -20,
                    categoryChanges: [
                        {
                            category: 'transporte',
                            currentAmount: 50,
                            previousAmount: 100,
                            change: -50,
                            changePercentage: -50,
                        },
                    ],
                },
            }

            // Act
            const result = await generateRecommendations(userId, analysis)

            // Assert
            const categoryRec = result.find(
                (r) =>
                    r.type === 'category_decrease' &&
                    r.category === 'transporte'
            )
            expect(categoryRec).toBeDefined()
            expect(categoryRec?.severity).toBe('success')
            expect(categoryRec?.message).toContain('transporte')
            expect(categoryRec?.message).toContain('disminuyó')
        })

        it('debería generar sugerencias de ahorro basadas en gastos altos', async () => {
            // Arrange
            const userId = 'test-user-123'
            delete process.env.GROQ_API_KEY

            const analysis = {
                currentMonth: {
                    total: 500,
                    byCategory: { alimentacion: 400 },
                    topStores: [],
                },
                previousMonth: {
                    total: 450,
                    byCategory: { alimentacion: 350 },
                },
                changes: {
                    totalChange: 50,
                    totalChangePercentage: 11.11,
                    categoryChanges: [],
                },
            }

            // Act
            const result = await generateRecommendations(userId, analysis)

            // Assert
            const savingRec = result.find(
                (r) =>
                    r.type === 'saving_suggestion' &&
                    r.category === 'alimentacion'
            )
            expect(savingRec).toBeDefined()
            expect(savingRec?.severity).toBe('info')
            expect(savingRec?.message).toContain('ahorrar')
            expect(savingRec?.amount).toBeGreaterThan(0)
        })

        it('debería generar recomendación sobre comercios frecuentes', async () => {
            // Arrange
            const userId = 'test-user-123'
            delete process.env.GROQ_API_KEY

            const analysis = {
                currentMonth: {
                    total: 300,
                    byCategory: {},
                    topStores: [{ store: 'CAFETERIA', amount: 100, visits: 5 }],
                },
                previousMonth: {
                    total: 280,
                    byCategory: {},
                },
                changes: {
                    totalChange: 20,
                    totalChangePercentage: 7.14,
                    categoryChanges: [],
                },
            }

            // Act
            const result = await generateRecommendations(userId, analysis)

            // Assert
            const storeRec = result.find(
                (r) =>
                    r.type === 'saving_suggestion' &&
                    r.message.includes('CAFETERIA')
            )
            expect(storeRec).toBeDefined()
            expect(storeRec?.severity).toBe('info')
            expect(storeRec?.message).toContain('planificar compras')
        })

        it('debería limitar las recomendaciones básicas a 6', async () => {
            // Arrange
            const userId = 'test-user-123'
            delete process.env.GROQ_API_KEY

            const analysis = {
                currentMonth: {
                    total: 800,
                    byCategory: {
                        alimentacion: 300,
                        ocio: 200,
                        transporte: 150,
                        salud: 100,
                        hogar: 50,
                    },
                    topStores: [
                        { store: 'TIENDA_A', amount: 300, visits: 10 },
                        { store: 'TIENDA_B', amount: 200, visits: 8 },
                    ],
                },
                previousMonth: {
                    total: 600,
                    byCategory: {
                        alimentacion: 250,
                        ocio: 150,
                        transporte: 100,
                        salud: 80,
                        hogar: 20,
                    },
                },
                changes: {
                    totalChange: 200,
                    totalChangePercentage: 33.33,
                    categoryChanges: [
                        {
                            category: 'alimentacion',
                            currentAmount: 300,
                            previousAmount: 250,
                            change: 50,
                            changePercentage: 20,
                        },
                        {
                            category: 'ocio',
                            currentAmount: 200,
                            previousAmount: 150,
                            change: 50,
                            changePercentage: 33.33,
                        },
                        {
                            category: 'transporte',
                            currentAmount: 150,
                            previousAmount: 100,
                            change: 50,
                            changePercentage: 50,
                        },
                    ],
                },
            }

            // Act
            const result = await generateRecommendations(userId, analysis)

            // Assert
            expect(result.length).toBeLessThanOrEqual(6)
        })

        it('debería manejar errores de IA y hacer fallback a recomendaciones básicas', async () => {
            // Arrange
            const userId = 'test-user-123'
            const analysis = {
                currentMonth: {
                    total: 500,
                    byCategory: { alimentacion: 300 },
                    topStores: [],
                },
                previousMonth: {
                    total: 400,
                    byCategory: { alimentacion: 250 },
                },
                changes: {
                    totalChange: 100,
                    totalChangePercentage: 25,
                    categoryChanges: [
                        {
                            category: 'alimentacion',
                            currentAmount: 300,
                            previousAmount: 250,
                            change: 50,
                            changePercentage: 20,
                        },
                    ],
                },
            }

            mockCreate.mockRejectedValue(new Error('IA service error'))

            // Act
            const result = await generateRecommendations(userId, analysis)

            // Assert
            expect(result.length).toBeGreaterThan(0)
            // Debería contener recomendaciones básicas generadas por fallback
            expect(result.some((r) => r.message.length > 0)).toBe(true)
        })

        it('no debería generar recomendaciones si el cambio es menor al 5%', async () => {
            // Arrange
            const userId = 'test-user-123'
            delete process.env.GROQ_API_KEY

            const analysis = {
                currentMonth: {
                    total: 502,
                    byCategory: {},
                    topStores: [],
                },
                previousMonth: {
                    total: 500,
                    byCategory: {},
                },
                changes: {
                    totalChange: 2,
                    totalChangePercentage: 0.4,
                    categoryChanges: [],
                },
            }

            // Act
            const result = await generateRecommendations(userId, analysis)

            // Assert
            const monthlyRec = result.find(
                (r) => r.type === 'monthly_comparison'
            )
            expect(monthlyRec).toBeUndefined()
        })

        it('debería calcular changePercentage=0 cuando previousAmount es 0', async () => {
            // Arrange
            const userId = 'test-user-123'

            const mockCurrentMonthTickets = [
                {
                    totalAmount: 100.0,
                    category: 'alimentacion',
                    storeName: 'NUEVO_COMERCIO',
                },
            ]

            ;(prisma.ticket.findMany as any)
                .mockResolvedValueOnce(mockCurrentMonthTickets)
                .mockResolvedValueOnce([]) // Mes anterior vacío

            // Act
            const result = await analyzeSpendingPatterns(userId)

            // Assert
            expect(result.changes.totalChangePercentage).toBe(0)
            const catChange = result.changes.categoryChanges.find(
                (c) => c.category === 'alimentacion'
            )
            expect(catChange?.changePercentage).toBe(0)
        })

        it('debería filtrar categorías con 0 en ambos periodos', async () => {
            // Arrange
            const userId = 'test-user-123'

            const mockCurrentMonthTickets = [
                {
                    totalAmount: 50.0,
                    category: 'alimentacion',
                    storeName: 'TIENDA',
                },
            ]

            const mockPreviousMonthTickets = [
                {
                    totalAmount: 50.0,
                    category: 'ocio',
                },
            ]

            ;(prisma.ticket.findMany as any)
                .mockResolvedValueOnce(mockCurrentMonthTickets)
                .mockResolvedValueOnce(mockPreviousMonthTickets)

            // Act
            const result = await analyzeSpendingPatterns(userId)

            // Assert
            // Solo debe haber cambios para las categorías con al menos uno > 0
            result.changes.categoryChanges.forEach((change) => {
                expect(
                    change.currentAmount > 0 || change.previousAmount > 0
                ).toBe(true)
            })
        })

        it('debería manejar categorías nuevas (solo en mes actual)', async () => {
            // Arrange
            const userId = 'test-user-123'

            const mockCurrentMonthTickets = [
                {
                    totalAmount: 100.0,
                    category: 'transporte',
                    storeName: 'TIENDA',
                },
            ]

            const mockPreviousMonthTickets = [
                {
                    totalAmount: 50.0,
                    category: 'alimentacion',
                },
            ]

            ;(prisma.ticket.findMany as any)
                .mockResolvedValueOnce(mockCurrentMonthTickets)
                .mockResolvedValueOnce(mockPreviousMonthTickets)

            // Act
            const result = await analyzeSpendingPatterns(userId)

            // Assert
            const transporteChange = result.changes.categoryChanges.find(
                (c) => c.category === 'transporte'
            )
            expect(transporteChange?.currentAmount).toBe(100)
            expect(transporteChange?.previousAmount).toBe(0)
        })

        it('debería manejar categorías que desaparecieron (solo en mes anterior)', async () => {
            // Arrange
            const userId = 'test-user-123'

            const mockCurrentMonthTickets = [
                {
                    totalAmount: 100.0,
                    category: 'alimentacion',
                    storeName: 'TIENDA',
                },
            ]

            const mockPreviousMonthTickets = [
                {
                    totalAmount: 50.0,
                    category: 'ocio',
                },
            ]

            ;(prisma.ticket.findMany as any)
                .mockResolvedValueOnce(mockCurrentMonthTickets)
                .mockResolvedValueOnce(mockPreviousMonthTickets)

            // Act
            const result = await analyzeSpendingPatterns(userId)

            // Assert
            const ocioChange = result.changes.categoryChanges.find(
                (c) => c.category === 'ocio'
            )
            expect(ocioChange?.currentAmount).toBe(0)
            expect(ocioChange?.previousAmount).toBe(50)
        })

        it('no debería generar sugerencias de ahorro para gastos bajos', async () => {
            // Arrange
            const userId = 'test-user-123'
            delete process.env.GROQ_API_KEY

            const analysis = {
                currentMonth: {
                    total: 80,
                    byCategory: { alimentacion: 50, otros: 30 },
                    topStores: [],
                },
                previousMonth: {
                    total: 75,
                    byCategory: {},
                },
                changes: {
                    totalChange: 5,
                    totalChangePercentage: 6.67,
                    categoryChanges: [],
                },
            }

            // Act
            const result = await generateRecommendations(userId, analysis)

            // Assert
            // No debería generar sugerencias de ahorro porque el gasto más alto es <= 100
            const savingRec = result.find(
                (r) => r.type === 'saving_suggestion' && r.category
            )
            expect(savingRec).toBeUndefined()
        })

        it('no debería generar recomendaciones sobre comercios con menos de 3 visitas', async () => {
            // Arrange
            const userId = 'test-user-123'
            delete process.env.GROQ_API_KEY

            const analysis = {
                currentMonth: {
                    total: 100,
                    byCategory: {},
                    topStores: [{ store: 'TIENDA_A', amount: 100, visits: 2 }],
                },
                previousMonth: {
                    total: 95,
                    byCategory: {},
                },
                changes: {
                    totalChange: 5,
                    totalChangePercentage: 5.26,
                    categoryChanges: [],
                },
            }

            // Act
            const result = await generateRecommendations(userId, analysis)

            // Assert
            const storeRec = result.find(
                (r) =>
                    r.type === 'saving_suggestion' &&
                    r.message.includes('TIENDA_A')
            )
            expect(storeRec).toBeUndefined()
        })

        it('debería generar recomendaciones con IA y luego complementar si son pocas', async () => {
            // Arrange
            const userId = 'test-user-123'
            const analysis = {
                currentMonth: {
                    total: 500,
                    byCategory: { alimentacion: 300, ocio: 200 },
                    topStores: [
                        { store: 'MERCADONA', amount: 300, visits: 10 },
                    ],
                },
                previousMonth: {
                    total: 400,
                    byCategory: { alimentacion: 250, ocio: 150 },
                },
                changes: {
                    totalChange: 100,
                    totalChangePercentage: 25,
                    categoryChanges: [
                        {
                            category: 'alimentacion',
                            currentAmount: 300,
                            previousAmount: 250,
                            change: 50,
                            changePercentage: 20,
                        },
                    ],
                },
            }

            // Mock de IA devolviendo solo 1 recomendación (debería complementar con básicas)
            const mockAIResponse = {
                choices: [
                    {
                        message: {
                            content: JSON.stringify([
                                {
                                    type: 'monthly_comparison',
                                    message: 'Recomendación de IA',
                                    severity: 'info',
                                },
                            ]),
                        },
                    },
                ],
            }

            mockCreate.mockResolvedValue(mockAIResponse)

            // Act
            const result = await generateRecommendations(userId, analysis)

            // Assert
            // Debería tener más de 1 (complementadas con básicas)
            expect(result.length).toBeGreaterThan(1)
        })

        it('debería parsear JSON extraído de texto con marcadores', async () => {
            // Arrange
            const userId = 'test-user-123'
            const analysis = {
                currentMonth: {
                    total: 500,
                    byCategory: { alimentacion: 300 },
                    topStores: [],
                },
                previousMonth: {
                    total: 400,
                    byCategory: { alimentacion: 250 },
                },
                changes: {
                    totalChange: 100,
                    totalChangePercentage: 25,
                    categoryChanges: [],
                },
            }

            // IA devuelve JSON con texto adicional
            const mockAIResponse = {
                choices: [
                    {
                        message: {
                            content: `Aquí están las recomendaciones:
                            [
                                {
                                    "type": "monthly_comparison",
                                    "message": "Gasto aumentó",
                                    "severity": "warning"
                                }
                            ]
                            Espero que te sean útiles.`,
                        },
                    },
                ],
            }

            mockCreate.mockResolvedValue(mockAIResponse)

            // Act
            const result = await generateRecommendations(userId, analysis)

            // Assert
            expect(result.length).toBeGreaterThan(0)
        })
    })
})
