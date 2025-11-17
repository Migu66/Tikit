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

// Importar después del mock
const { structureTicketData, classifyTicket } = await import(
    '@/lib/services/ai'
)

describe('Servicio AI (Groq)', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockCreate.mockReset()
    })

    describe('structureTicketData', () => {
        it('debería estructurar correctamente los datos de un ticket', async () => {
            // Arrange
            const ocrText = `MERCADONA
      Fecha: 15/11/2024
      Pan: 1.50€
      Leche: 2.30€
      TOTAL: 3.80€
      IVA: 0.38€`

            const mockAIResponse = {
                choices: [
                    {
                        message: {
                            content: JSON.stringify({
                                storeName: 'MERCADONA',
                                totalAmount: 3.8,
                                tax: 0.38,
                                purchaseDate: '2024-11-15T00:00:00.000Z',
                                products: [
                                    {
                                        name: 'Pan',
                                        quantity: 1,
                                        unitPrice: 1.5,
                                        totalPrice: 1.5,
                                    },
                                    {
                                        name: 'Leche',
                                        quantity: 1,
                                        unitPrice: 2.3,
                                        totalPrice: 2.3,
                                    },
                                ],
                            }),
                        },
                    },
                ],
            }

            mockCreate.mockResolvedValue(mockAIResponse)

            // Act
            const result = await structureTicketData(ocrText)

            // Assert
            expect(result).toBeDefined()
            expect(result.storeName).toBe('MERCADONA')
            expect(result.totalAmount).toBe(3.8)
            expect(result.tax).toBe(0.38)
            expect(result.products).toHaveLength(2)
            expect(result.products[0].name).toBe('Pan')
            expect(result.products[1].name).toBe('Leche')
        })

        it('debería crear producto genérico si no hay lista de productos', async () => {
            // Arrange
            const ocrText = 'SUPERMERCADO - TOTAL: 50.00€'

            const mockAIResponse = {
                choices: [
                    {
                        message: {
                            content: JSON.stringify({
                                storeName: 'SUPERMERCADO',
                                totalAmount: 50.0,
                                tax: null,
                                purchaseDate: new Date().toISOString(),
                                // No incluir products para que use el fallback
                            }),
                        },
                    },
                ],
            }

            mockCreate.mockResolvedValue(mockAIResponse)

            // Act
            const result = await structureTicketData(ocrText)

            // Assert
            expect(result.products).toHaveLength(1)
            expect(result.products[0].name).toBe('Compra')
            expect(result.products[0].totalPrice).toBe(50.0)
        })

        it('debería usar valores por defecto si faltan datos', async () => {
            // Arrange
            const ocrText = 'Ticket incompleto'

            const mockAIResponse = {
                choices: [
                    {
                        message: {
                            content: JSON.stringify({
                                totalAmount: 10,
                            }),
                        },
                    },
                ],
            }

            mockCreate.mockResolvedValue(mockAIResponse)

            // Act
            const result = await structureTicketData(ocrText)

            // Assert
            expect(result.storeName).toBe('Establecimiento desconocido')
            expect(result.totalAmount).toBe(10)
            expect(result.purchaseDate).toBeInstanceOf(Date)
        })

        it('debería lanzar error si GROQ_API_KEY no está configurada', async () => {
            // Arrange
            const originalKey = process.env.GROQ_API_KEY
            delete process.env.GROQ_API_KEY
            const ocrText = 'Test'

            // Act & Assert
            await expect(structureTicketData(ocrText)).rejects.toThrow(
                'GROQ_API_KEY no está configurada'
            )

            // Restore
            process.env.GROQ_API_KEY = originalKey
        })

        it('debería manejar respuestas JSON mal formadas', async () => {
            // Arrange
            const ocrText = 'Test'

            const mockAIResponse = {
                choices: [
                    {
                        message: {
                            content:
                                'Aquí está el JSON: {"storeName": "Test", "totalAmount": 10}',
                        },
                    },
                ],
            }

            mockCreate.mockResolvedValue(mockAIResponse)

            // Act
            const result = await structureTicketData(ocrText)

            // Assert
            expect(result.storeName).toBe('Test')
            expect(result.totalAmount).toBe(10)
        })

        it('debería manejar errores de la API de Groq', async () => {
            // Arrange
            const ocrText = 'Test'
            mockCreate.mockRejectedValue(new Error('API Error'))

            // Act & Assert
            await expect(structureTicketData(ocrText)).rejects.toThrow(
                'Error al procesar los datos del ticket con IA'
            )
        })

        it('debería lanzar error específico para API key inválida', async () => {
            // Arrange
            const ocrText = 'Test'
            const apiKeyError = new Error('Invalid API key')
            mockCreate.mockRejectedValue(apiKeyError)

            // Act & Assert
            await expect(structureTicketData(ocrText)).rejects.toThrow(
                'API Key de Groq inválida'
            )
        })

        it('debería manejar JSON parsing errors con fallback', async () => {
            // Arrange
            const ocrText = 'Test'

            const mockAIResponse = {
                choices: [
                    {
                        message: {
                            content: 'Esto no es JSON válido',
                        },
                    },
                ],
            }

            mockCreate.mockResolvedValue(mockAIResponse)

            // Act & Assert
            await expect(structureTicketData(ocrText)).rejects.toThrow()
        })
    })

    describe('classifyTicket', () => {
        it('debería clasificar correctamente un ticket de alimentación', async () => {
            // Arrange
            const storeName = 'MERCADONA'
            const products = [{ name: 'Pan' }, { name: 'Leche' }]

            const mockAIResponse = {
                choices: [
                    {
                        message: {
                            content: 'alimentacion',
                        },
                    },
                ],
            }

            mockCreate.mockResolvedValue(mockAIResponse)

            // Act
            const result = await classifyTicket(storeName, products)

            // Assert
            expect(result).toBe(TicketCategory.ALIMENTACION)
        })

        it('debería devolver "otros" para categorías inválidas', async () => {
            // Arrange
            const storeName = 'TEST'
            const products = [{ name: 'Producto' }]

            const mockAIResponse = {
                choices: [
                    {
                        message: {
                            content: 'categoria_invalida',
                        },
                    },
                ],
            }

            mockCreate.mockResolvedValue(mockAIResponse)

            // Act
            const result = await classifyTicket(storeName, products)

            // Assert
            expect(result).toBe(TicketCategory.OTROS)
        })

        it('debería devolver "otros" si no hay API key configurada', async () => {
            // Arrange
            const originalKey = process.env.GROQ_API_KEY
            delete process.env.GROQ_API_KEY
            const storeName = 'TEST'
            const products = [{ name: 'Producto' }]

            // Act
            const result = await classifyTicket(storeName, products)

            // Assert
            expect(result).toBe(TicketCategory.OTROS)

            // Restore
            process.env.GROQ_API_KEY = originalKey
        })

        it('debería manejar errores de clasificación devolviendo "otros"', async () => {
            // Arrange
            const storeName = 'TEST'
            const products = [{ name: 'Producto' }]

            mockCreate.mockRejectedValue(new Error('API Error'))

            // Act
            const result = await classifyTicket(storeName, products)

            // Assert
            expect(result).toBe(TicketCategory.OTROS)
        })

        it('debería manejar respuestas vacías devolviendo "otros"', async () => {
            // Arrange
            const storeName = 'TEST'
            const products = [{ name: 'Producto' }]

            const mockAIResponse = {
                choices: [
                    {
                        message: {
                            content: '',
                        },
                    },
                ],
            }

            mockCreate.mockResolvedValue(mockAIResponse)

            // Act
            const result = await classifyTicket(storeName, products)

            // Assert
            expect(result).toBe(TicketCategory.OTROS)
        })

        it('debería limpiar espacios en blanco de la respuesta', async () => {
            // Arrange
            const storeName = 'TEST'
            const products = [{ name: 'Producto' }]

            const mockAIResponse = {
                choices: [
                    {
                        message: {
                            content: '  ocio  ',
                        },
                    },
                ],
            }

            mockCreate.mockResolvedValue(mockAIResponse)

            // Act
            const result = await classifyTicket(storeName, products)

            // Assert
            expect(result).toBe(TicketCategory.OCIO)
        })

        it('debería validar todas las categorías correctamente', async () => {
            // Test para cada categoría válida
            const categories = [
                TicketCategory.ALIMENTACION,
                TicketCategory.OCIO,
                TicketCategory.TRANSPORTE,
                TicketCategory.SALUD,
                TicketCategory.HOGAR,
                TicketCategory.OTROS,
            ]

            for (const category of categories) {
                const mockAIResponse = {
                    choices: [
                        {
                            message: {
                                content: category,
                            },
                        },
                    ],
                }

                mockCreate.mockResolvedValue(mockAIResponse)

                const result = await classifyTicket('TEST', [
                    { name: 'Producto' },
                ])
                expect(result).toBe(category)
            }
        })
    })
})
