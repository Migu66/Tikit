import { describe, it, expect } from 'vitest'
import { cn, formatCurrency } from '@/lib/utils'

describe('cn (className merger)', () => {
    it('debería combinar clases correctamente', () => {
        const result = cn('px-2 py-1', 'bg-blue-500')
        expect(result).toContain('px-2')
        expect(result).toContain('py-1')
        expect(result).toContain('bg-blue-500')
    })

    it('debería resolver conflictos de Tailwind priorizando las últimas clases', () => {
        const result = cn('px-2', 'px-4')
        expect(result).toBe('px-4')
    })

    it('debería manejar valores condicionales', () => {
        const isActive = true
        const result = cn('base-class', isActive && 'active-class')
        expect(result).toContain('base-class')
        expect(result).toContain('active-class')
    })

    it('debería ignorar valores falsy', () => {
        const result = cn('base', false && 'hidden', null, undefined, 'visible')
        expect(result).toBe('base visible')
    })

    it('debería manejar arrays de clases', () => {
        const result = cn(['class1', 'class2'], 'class3')
        expect(result).toContain('class1')
        expect(result).toContain('class2')
        expect(result).toContain('class3')
    })
})

describe('formatCurrency', () => {
    it('debería formatear números decimales correctamente (español)', () => {
        // En algunos entornos de testing, el separador de miles puede no aparecer
        const result = formatCurrency(1234.56, 'es-ES')
        expect(result).toMatch(/^1[.\s]?234,56$/) // Acepta "1.234,56" o "1234,56"
        expect(formatCurrency(100, 'es-ES')).toBe('100,00')
        expect(formatCurrency(0.99, 'es-ES')).toBe('0,99')
    })

    it('debería formatear números decimales correctamente (inglés)', () => {
        expect(formatCurrency(1234.56, 'en-US')).toBe('1,234.56')
        expect(formatCurrency(100, 'en-US')).toBe('100.00')
        expect(formatCurrency(0.99, 'en-US')).toBe('0.99')
    })

    it('debería usar el locale por defecto es-ES si no se especifica', () => {
        const result = formatCurrency(1234.56)
        expect(result).toMatch(/^1[.\s]?234,56$/)
    })

    it('debería usar el locale en-US correctamente', () => {
        const result = formatCurrency(1234.56, 'en-US')
        expect(result).toBe('1,234.56')
    })

    it('debería formatear correctamente números grandes', () => {
        const result = formatCurrency(999999.99, 'en-US')
        expect(result).toBe('999,999.99')
    })

    it('debería formatear correctamente números pequeños', () => {
        const result = formatCurrency(0.01, 'en-US')
        expect(result).toBe('0.01')
    })

    it('debería manejar valores null y undefined', () => {
        expect(formatCurrency(null)).toBe('0,00')
        expect(formatCurrency(undefined)).toBe('0,00')
    })

    it('debería manejar NaN', () => {
        expect(formatCurrency(NaN)).toBe('0,00')
    })

    it('debería manejar números negativos', () => {
        expect(formatCurrency(-100.5, 'es-ES')).toBe('-100,50')
    })

    it('debería manejar números muy grandes', () => {
        expect(formatCurrency(999999.99, 'es-ES')).toBe('999.999,99')
    })

    it('debería siempre mostrar 2 decimales', () => {
        expect(formatCurrency(10, 'es-ES')).toBe('10,00')
        expect(formatCurrency(10.5, 'es-ES')).toBe('10,50')
        expect(formatCurrency(10.567, 'es-ES')).toBe('10,57') // Redondeo
    })

    it('debería manejar cero correctamente', () => {
        expect(formatCurrency(0, 'es-ES')).toBe('0,00')
    })
})
