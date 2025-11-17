import { describe, it, expect, vi, beforeEach } from 'vitest'
import { extractTextFromImage, preprocessOCRText } from '@/lib/services/ocr'
import axios from 'axios'

// Mock de axios
vi.mock('axios')
const mockedAxios = axios as any

describe('Servicio OCR', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('extractTextFromImage', () => {
        it('debería extraer texto exitosamente de una imagen', async () => {
            // Arrange
            const mockBuffer = Buffer.from('fake-image-data')
            const mockResponse = {
                data: {
                    IsErroredOnProcessing: false,
                    ParsedResults: [
                        {
                            ParsedText:
                                'SUPERMERCADO TEST\nTOTAL: 25.50€\nFecha: 01/01/2024',
                        },
                    ],
                },
            }

            mockedAxios.post.mockResolvedValue(mockResponse)

            // Act
            const result = await extractTextFromImage(mockBuffer)

            // Assert
            expect(result).toBeDefined()
            expect(result.text).toBeTruthy()
            expect(result.confidence).toBe(85)
            expect(mockedAxios.post).toHaveBeenCalledWith(
                'https://api.ocr.space/parse/image',
                expect.objectContaining({
                    language: 'spa',
                    detectOrientation: true,
                    scale: true,
                }),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                    }),
                })
            )
        })

        it('debería manejar errores de procesamiento de OCR', async () => {
            // Arrange
            const mockBuffer = Buffer.from('fake-image-data')
            const mockResponse = {
                data: {
                    IsErroredOnProcessing: true,
                    ErrorMessage: ['Error al procesar la imagen'],
                },
            }

            mockedAxios.post.mockResolvedValue(mockResponse)

            // Act & Assert
            await expect(extractTextFromImage(mockBuffer)).rejects.toThrow(
                'Error al procesar la imagen'
            )
        })

        it('debería lanzar error si no hay resultados parseados', async () => {
            // Arrange
            const mockBuffer = Buffer.from('fake-image-data')
            const mockResponse = {
                data: {
                    IsErroredOnProcessing: false,
                    ParsedResults: [],
                },
            }

            mockedAxios.post.mockResolvedValue(mockResponse)

            // Act & Assert
            await expect(extractTextFromImage(mockBuffer)).rejects.toThrow(
                'No se pudo extraer texto de la imagen'
            )
        })

        it('debería lanzar error si el texto extraído está vacío', async () => {
            // Arrange
            const mockBuffer = Buffer.from('fake-image-data')
            const mockResponse = {
                data: {
                    IsErroredOnProcessing: false,
                    ParsedResults: [{ ParsedText: '   ' }],
                },
            }

            mockedAxios.post.mockResolvedValue(mockResponse)

            // Act & Assert
            await expect(extractTextFromImage(mockBuffer)).rejects.toThrow(
                'No se encontró texto en la imagen'
            )
        })

        it('debería manejar errores genéricos durante el procesamiento', async () => {
            // Arrange
            const mockBuffer = Buffer.from('fake-image-data')
            const genericError = new Error('Network error')

            mockedAxios.post.mockRejectedValue(genericError)

            // Act & Assert
            await expect(extractTextFromImage(mockBuffer)).rejects.toThrow(
                'Error al procesar la imagen con OCR: Network error'
            )
        })

        it('debería manejar errores sin mensaje específico', async () => {
            // Arrange
            const mockBuffer = Buffer.from('fake-image-data')

            mockedAxios.post.mockRejectedValue('Unknown error')

            // Act & Assert
            await expect(extractTextFromImage(mockBuffer)).rejects.toThrow(
                'Error al procesar la imagen con OCR'
            )
        })

        it('debería incluir la API key en los headers', async () => {
            // Arrange
            const mockBuffer = Buffer.from('fake-image-data')
            const mockResponse = {
                data: {
                    IsErroredOnProcessing: false,
                    ParsedResults: [{ ParsedText: 'Test text' }],
                },
            }

            mockedAxios.post.mockResolvedValue(mockResponse)

            // Act
            await extractTextFromImage(mockBuffer)

            // Assert
            expect(mockedAxios.post).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(Object),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        apikey: expect.any(String),
                    }),
                })
            )
        })
    })

    describe('preprocessOCRText', () => {
        it('debería normalizar espacios en blanco', () => {
            const text = 'TEXTO    CON     ESPACIOS    MÚLTIPLES'
            const result = preprocessOCRText(text)
            expect(result).toBe('TEXTO CON ESPACIOS MÚLTIPLES')
        })

        it('debería corregir pipes por I mayúscula', () => {
            const text = 'TOT|AL: 25|50'
            const result = preprocessOCRText(text)
            expect(result).toBe('TOTIAL: 25I50')
        })

        it('debería eliminar espacios al inicio y final', () => {
            const text = '   TEXTO CON ESPACIOS   '
            const result = preprocessOCRText(text)
            expect(result).toBe('TEXTO CON ESPACIOS')
        })

        it('debería normalizar saltos de línea múltiples', () => {
            const text = 'LÍNEA 1\n\n\nLÍNEA 2'
            const result = preprocessOCRText(text)
            expect(result).toBe('LÍNEA 1 LÍNEA 2')
        })

        it('debería manejar texto vacío', () => {
            const text = ''
            const result = preprocessOCRText(text)
            expect(result).toBe('')
        })

        it('debería manejar combinación de problemas', () => {
            const text = '  TOT|AL:    25|50€  \n\n  GRAC|AS  '
            const result = preprocessOCRText(text)
            expect(result).toBe('TOTIAL: 25I50€ GRACIAS')
        })
    })
})
