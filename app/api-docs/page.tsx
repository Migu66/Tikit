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
            <div className="flex min-h-screen items-center justify-center bg-paper">
                <div className="text-center">
                    <p className="font-mono text-xs font-bold tracking-[0.4em] text-ink">
                        ▮▮▮<span className="tk-blink text-thermal">▮</span>
                    </p>
                    <p className="mt-4 font-mono text-xs tracking-[0.2em] text-ash">
                        API DOCS
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
