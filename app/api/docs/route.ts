/**
 * @swagger
 * /api/docs:
 *   get:
 *     summary: Obtiene la especificación OpenAPI en formato JSON
 *     tags: [Documentation]
 *     responses:
 *       200:
 *         description: Especificación OpenAPI
 */

import { NextResponse } from 'next/server'
import { getApiDocs } from '@/lib/swagger'

export async function GET() {
    const spec = getApiDocs()
    return NextResponse.json(spec)
}
