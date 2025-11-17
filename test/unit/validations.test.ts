import { describe, it, expect } from 'vitest'
import {
    ticketProductSchema,
    ticketDataSchema,
    uploadFileSchema,
} from '@/lib/validations/ticket'

describe('Validaciones de Ticket', () => {
    describe('ticketProductSchema', () => {
        it('debería validar un producto correcto', () => {
            const validProduct = {
                name: 'Pan integral',
                quantity: 2,
                unitPrice: 1.5,
                totalPrice: 3.0,
            }

            const result = ticketProductSchema.safeParse(validProduct)
            expect(result.success).toBe(true)
        })

        it('debería rechazar producto sin nombre', () => {
            const invalidProduct = {
                name: '',
                quantity: 1,
                unitPrice: 1.5,
                totalPrice: 1.5,
            }

            const result = ticketProductSchema.safeParse(invalidProduct)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain(
                    'nombre del producto es requerido'
                )
            }
        })

        it('debería rechazar cantidad negativa', () => {
            const invalidProduct = {
                name: 'Producto',
                quantity: -1,
                unitPrice: 1.5,
                totalPrice: 1.5,
            }

            const result = ticketProductSchema.safeParse(invalidProduct)
            expect(result.success).toBe(false)
        })

        it('debería rechazar cantidad decimal', () => {
            const invalidProduct = {
                name: 'Producto',
                quantity: 1.5,
                unitPrice: 1.5,
                totalPrice: 2.25,
            }

            const result = ticketProductSchema.safeParse(invalidProduct)
            expect(result.success).toBe(false)
        })

        it('debería rechazar precio unitario negativo', () => {
            const invalidProduct = {
                name: 'Producto',
                quantity: 1,
                unitPrice: -1.5,
                totalPrice: -1.5,
            }

            const result = ticketProductSchema.safeParse(invalidProduct)
            expect(result.success).toBe(false)
        })

        it('debería aceptar precio unitario cero', () => {
            const validProduct = {
                name: 'Producto gratis',
                quantity: 1,
                unitPrice: 0,
                totalPrice: 0,
            }

            const result = ticketProductSchema.safeParse(validProduct)
            expect(result.success).toBe(true)
        })

        it('debería rechazar precio total negativo', () => {
            const invalidProduct = {
                name: 'Producto',
                quantity: 1,
                unitPrice: 1.5,
                totalPrice: -1.5,
            }

            const result = ticketProductSchema.safeParse(invalidProduct)
            expect(result.success).toBe(false)
        })
    })

    describe('ticketDataSchema', () => {
        it('debería validar datos completos de ticket', () => {
            const validTicket = {
                storeName: 'MERCADONA',
                totalAmount: 25.5,
                tax: 2.55,
                purchaseDate: new Date('2024-11-15'),
                products: [
                    {
                        name: 'Pan',
                        quantity: 1,
                        unitPrice: 1.5,
                        totalPrice: 1.5,
                    },
                    {
                        name: 'Leche',
                        quantity: 2,
                        unitPrice: 1.2,
                        totalPrice: 2.4,
                    },
                ],
                category: 'alimentacion',
            }

            const result = ticketDataSchema.safeParse(validTicket)
            expect(result.success).toBe(true)
        })

        it('debería aceptar ticket sin categoría', () => {
            const validTicket = {
                storeName: 'MERCADONA',
                totalAmount: 25.5,
                tax: 2.55,
                purchaseDate: new Date('2024-11-15'),
                products: [
                    {
                        name: 'Pan',
                        quantity: 1,
                        unitPrice: 1.5,
                        totalPrice: 1.5,
                    },
                ],
            }

            const result = ticketDataSchema.safeParse(validTicket)
            expect(result.success).toBe(true)
        })

        it('debería aceptar ticket sin IVA', () => {
            const validTicket = {
                storeName: 'MERCADONA',
                totalAmount: 25.5,
                purchaseDate: new Date('2024-11-15'),
                products: [
                    {
                        name: 'Pan',
                        quantity: 1,
                        unitPrice: 1.5,
                        totalPrice: 1.5,
                    },
                ],
            }

            const result = ticketDataSchema.safeParse(validTicket)
            expect(result.success).toBe(true)
        })

        it('debería rechazar ticket sin nombre de tienda', () => {
            const invalidTicket = {
                storeName: '',
                totalAmount: 25.5,
                purchaseDate: new Date(),
                products: [
                    {
                        name: 'Pan',
                        quantity: 1,
                        unitPrice: 1.5,
                        totalPrice: 1.5,
                    },
                ],
            }

            const result = ticketDataSchema.safeParse(invalidTicket)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain(
                    'establecimiento es requerido'
                )
            }
        })

        it('debería rechazar total cero o negativo', () => {
            const invalidTicket = {
                storeName: 'MERCADONA',
                totalAmount: 0,
                purchaseDate: new Date(),
                products: [
                    {
                        name: 'Pan',
                        quantity: 1,
                        unitPrice: 1.5,
                        totalPrice: 1.5,
                    },
                ],
            }

            const result = ticketDataSchema.safeParse(invalidTicket)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain(
                    'total debe ser mayor que cero'
                )
            }
        })

        it('debería rechazar ticket sin productos', () => {
            const invalidTicket = {
                storeName: 'MERCADONA',
                totalAmount: 25.5,
                purchaseDate: new Date(),
                products: [],
            }

            const result = ticketDataSchema.safeParse(invalidTicket)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain(
                    'al menos un producto'
                )
            }
        })

        it('debería rechazar categoría inválida', () => {
            const invalidTicket = {
                storeName: 'MERCADONA',
                totalAmount: 25.5,
                purchaseDate: new Date(),
                products: [
                    {
                        name: 'Pan',
                        quantity: 1,
                        unitPrice: 1.5,
                        totalPrice: 1.5,
                    },
                ],
                category: 'categoria_inexistente',
            }

            const result = ticketDataSchema.safeParse(invalidTicket)
            expect(result.success).toBe(false)
        })

        it('debería validar todas las categorías permitidas', () => {
            const categories = [
                'alimentacion',
                'ocio',
                'transporte',
                'salud',
                'hogar',
                'otros',
            ]

            categories.forEach((category) => {
                const ticket = {
                    storeName: 'TIENDA',
                    totalAmount: 10,
                    purchaseDate: new Date(),
                    products: [
                        {
                            name: 'Producto',
                            quantity: 1,
                            unitPrice: 10,
                            totalPrice: 10,
                        },
                    ],
                    category,
                }

                const result = ticketDataSchema.safeParse(ticket)
                expect(result.success).toBe(true)
            })
        })

        it('debería rechazar fecha no válida', () => {
            const invalidTicket = {
                storeName: 'MERCADONA',
                totalAmount: 25.5,
                purchaseDate: 'not-a-date',
                products: [
                    {
                        name: 'Pan',
                        quantity: 1,
                        unitPrice: 1.5,
                        totalPrice: 1.5,
                    },
                ],
            }

            const result = ticketDataSchema.safeParse(invalidTicket)
            expect(result.success).toBe(false)
        })

        it('debería aceptar IVA como null', () => {
            const validTicket = {
                storeName: 'MERCADONA',
                totalAmount: 25.5,
                tax: null,
                purchaseDate: new Date(),
                products: [
                    {
                        name: 'Pan',
                        quantity: 1,
                        unitPrice: 1.5,
                        totalPrice: 1.5,
                    },
                ],
            }

            const result = ticketDataSchema.safeParse(validTicket)
            expect(result.success).toBe(true)
        })

        it('debería rechazar IVA negativo', () => {
            const invalidTicket = {
                storeName: 'MERCADONA',
                totalAmount: 25.5,
                tax: -2.55,
                purchaseDate: new Date(),
                products: [
                    {
                        name: 'Pan',
                        quantity: 1,
                        unitPrice: 1.5,
                        totalPrice: 1.5,
                    },
                ],
            }

            const result = ticketDataSchema.safeParse(invalidTicket)
            expect(result.success).toBe(false)
        })
    })

    describe('uploadFileSchema', () => {
        it('debería validar archivo de imagen JPG correcto', () => {
            const validFile = new File(['dummy'], 'ticket.jpg', {
                type: 'image/jpeg',
            })
            Object.defineProperty(validFile, 'size', { value: 1024 * 1024 }) // 1MB

            const result = uploadFileSchema.safeParse({ file: validFile })
            expect(result.success).toBe(true)
        })

        it('debería validar archivo de imagen JPEG correcto', () => {
            const validFile = new File(['dummy'], 'ticket.jpeg', {
                type: 'image/jpeg',
            })
            Object.defineProperty(validFile, 'size', { value: 1024 * 1024 })

            const result = uploadFileSchema.safeParse({ file: validFile })
            expect(result.success).toBe(true)
        })

        it('debería validar archivo de imagen PNG correcto', () => {
            const validFile = new File(['dummy'], 'ticket.png', {
                type: 'image/png',
            })
            Object.defineProperty(validFile, 'size', { value: 2 * 1024 * 1024 }) // 2MB

            const result = uploadFileSchema.safeParse({ file: validFile })
            expect(result.success).toBe(true)
        })

        it('debería validar archivo de imagen WebP correcto', () => {
            const validFile = new File(['dummy'], 'ticket.webp', {
                type: 'image/webp',
            })
            Object.defineProperty(validFile, 'size', { value: 1024 * 1024 })

            const result = uploadFileSchema.safeParse({ file: validFile })
            expect(result.success).toBe(true)
        })

        it('debería validar archivo PDF correcto', () => {
            const validFile = new File(['dummy'], 'ticket.pdf', {
                type: 'application/pdf',
            })
            Object.defineProperty(validFile, 'size', { value: 3 * 1024 * 1024 }) // 3MB

            const result = uploadFileSchema.safeParse({ file: validFile })
            expect(result.success).toBe(true)
        })

        it('debería rechazar archivo que excede el tamaño máximo', () => {
            const invalidFile = new File(['dummy'], 'ticket.jpg', {
                type: 'image/jpeg',
            })
            Object.defineProperty(invalidFile, 'size', {
                value: 11 * 1024 * 1024,
            }) // 11MB

            const result = uploadFileSchema.safeParse({ file: invalidFile })
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('máximo 10MB')
            }
        })

        it('debería rechazar archivo con tipo MIME inválido', () => {
            const invalidFile = new File(['dummy'], 'ticket.txt', {
                type: 'text/plain',
            })
            Object.defineProperty(invalidFile, 'size', { value: 1024 })

            const result = uploadFileSchema.safeParse({ file: invalidFile })
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain(
                    'imagen (JPEG, PNG, WebP) o PDF'
                )
            }
        })

        it('debería rechazar si no es una instancia de File', () => {
            const notAFile = { name: 'fake.jpg', size: 1024 }

            const result = uploadFileSchema.safeParse({ file: notAFile })
            expect(result.success).toBe(false)
        })

        it('debería rechazar archivo GIF (tipo no soportado)', () => {
            const invalidFile = new File(['dummy'], 'ticket.gif', {
                type: 'image/gif',
            })
            Object.defineProperty(invalidFile, 'size', { value: 1024 * 1024 })

            const result = uploadFileSchema.safeParse({ file: invalidFile })
            expect(result.success).toBe(false)
        })
    })
})
