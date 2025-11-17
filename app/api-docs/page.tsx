'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import 'swagger-ui-react/swagger-ui.css'
import { swaggerUIConfig, customSwaggerCSS } from '@/lib/swagger-config'

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })

export default function ApiDocsPage() {
    const [spec, setSpec] = useState(null)

    useEffect(() => {
        fetch('/api/docs')
            .then((res) => res.json())
            .then((data) => setSpec(data))
            .catch((err) => console.error('Error cargando documentación:', err))
    }, [])

    if (!spec) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">
                        Cargando documentación de la API...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <>
            <style>{customSwaggerCSS}</style>
            <div className="min-h-screen bg-white">
                <div className="container mx-auto px-4 py-8">
                    <SwaggerUI spec={spec} {...swaggerUIConfig} />
                </div>
            </div>
        </>
    )
}
