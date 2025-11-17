/**
 * Configuración de Swagger para documentación de API
 */

import { createSwaggerSpec } from 'next-swagger-doc'

export const getApiDocs = () => {
    const spec = createSwaggerSpec({
        apiFolder: 'app/api',
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'Tikit API Documentation',
                version: '1.0.0',
                description:
                    'Documentación de la API de Tikit. Esta API permite gestionar usuarios, tickets de compra, estadísticas y recomendaciones inteligentes basadas en IA.',
            },
            tags: [
                {
                    name: 'Auth',
                    description:
                        'Endpoints de autenticación y registro de usuarios',
                },
                {
                    name: 'Tickets',
                    description:
                        'Gestión de tickets de compra (subir, listar, eliminar)',
                },
                {
                    name: 'Dashboard',
                    description: 'Estadísticas y datos del dashboard',
                },
                {
                    name: 'Profile',
                    description: 'Gestión del perfil de usuario',
                },
                {
                    name: 'Recommendations',
                    description: 'Recomendaciones inteligentes basadas en IA',
                },
            ],
            components: {
                securitySchemes: {
                    sessionAuth: {
                        type: 'apiKey',
                        in: 'cookie',
                        name: 'next-auth.session-token',
                        description:
                            'Autenticación basada en sesión de NextAuth',
                    },
                },
                schemas: {
                    User: {
                        type: 'object',
                        properties: {
                            id: {
                                type: 'string',
                                description: 'ID único del usuario',
                            },
                            name: {
                                type: 'string',
                                description: 'Nombre completo del usuario',
                            },
                            email: {
                                type: 'string',
                                format: 'email',
                                description: 'Email del usuario',
                            },
                            image: {
                                type: 'string',
                                format: 'uri',
                                nullable: true,
                                description: 'URL de la foto de perfil',
                            },
                            createdAt: {
                                type: 'string',
                                format: 'date-time',
                                description: 'Fecha de creación de la cuenta',
                            },
                        },
                    },
                    Ticket: {
                        type: 'object',
                        properties: {
                            id: {
                                type: 'string',
                                description: 'ID único del ticket',
                            },
                            storeName: {
                                type: 'string',
                                description: 'Nombre del comercio',
                            },
                            totalAmount: {
                                type: 'number',
                                format: 'float',
                                description: 'Importe total del ticket',
                            },
                            tax: {
                                type: 'number',
                                format: 'float',
                                nullable: true,
                                description: 'IVA del ticket',
                            },
                            category: {
                                type: 'string',
                                enum: [
                                    'FOOD',
                                    'ENTERTAINMENT',
                                    'TRANSPORT',
                                    'HEALTH',
                                    'HOME',
                                    'OTHER',
                                ],
                                description: 'Categoría del ticket',
                            },
                            purchaseDate: {
                                type: 'string',
                                format: 'date-time',
                                description: 'Fecha de compra',
                            },
                            imageUrl: {
                                type: 'string',
                                format: 'uri',
                                description:
                                    'URL de la imagen del ticket en Cloudinary',
                            },
                            ocrText: {
                                type: 'string',
                                nullable: true,
                                description: 'Texto extraído por OCR',
                            },
                            products: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        name: {
                                            type: 'string',
                                            description: 'Nombre del producto',
                                        },
                                        quantity: {
                                            type: 'number',
                                            description: 'Cantidad',
                                        },
                                        price: {
                                            type: 'number',
                                            format: 'float',
                                            description: 'Precio unitario',
                                        },
                                    },
                                },
                                description: 'Lista de productos del ticket',
                            },
                        },
                    },
                    Stats: {
                        type: 'object',
                        properties: {
                            totalSpent: {
                                type: 'number',
                                format: 'float',
                                description: 'Gasto total del período',
                            },
                            totalTickets: {
                                type: 'number',
                                description: 'Número total de tickets',
                            },
                            categoryBreakdown: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        category: {
                                            type: 'string',
                                            description:
                                                'Nombre de la categoría',
                                        },
                                        total: {
                                            type: 'number',
                                            format: 'float',
                                            description:
                                                'Gasto total en la categoría',
                                        },
                                        count: {
                                            type: 'number',
                                            description:
                                                'Número de tickets en la categoría',
                                        },
                                    },
                                },
                                description: 'Desglose de gastos por categoría',
                            },
                            trends: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        month: {
                                            type: 'string',
                                            description:
                                                'Mes (formato YYYY-MM)',
                                        },
                                        total: {
                                            type: 'number',
                                            format: 'float',
                                            description: 'Gasto total del mes',
                                        },
                                    },
                                },
                                description: 'Tendencias de gasto mensuales',
                            },
                            topStores: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        storeName: {
                                            type: 'string',
                                            description: 'Nombre del comercio',
                                        },
                                        total: {
                                            type: 'number',
                                            format: 'float',
                                            description:
                                                'Gasto total en el comercio',
                                        },
                                        count: {
                                            type: 'number',
                                            description: 'Número de compras',
                                        },
                                    },
                                },
                                description:
                                    'Top 10 comercios más frecuentados',
                            },
                        },
                    },
                    Recommendation: {
                        type: 'object',
                        properties: {
                            id: {
                                type: 'string',
                                description: 'ID de la recomendación',
                            },
                            type: {
                                type: 'string',
                                enum: ['increase', 'decrease', 'suggestion'],
                                description: 'Tipo de recomendación',
                            },
                            category: {
                                type: 'string',
                                nullable: true,
                                description: 'Categoría relacionada',
                            },
                            message: {
                                type: 'string',
                                description: 'Mensaje de la recomendación',
                            },
                            impact: {
                                type: 'string',
                                enum: ['low', 'medium', 'high'],
                                description: 'Nivel de impacto',
                            },
                            createdAt: {
                                type: 'string',
                                format: 'date-time',
                                description: 'Fecha de creación',
                            },
                        },
                    },
                    Error: {
                        type: 'object',
                        properties: {
                            error: {
                                type: 'string',
                                description: 'Mensaje de error',
                            },
                            message: {
                                type: 'string',
                                description: 'Detalles adicionales del error',
                            },
                            details: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                },
                                description:
                                    'Detalles de validación (si aplica)',
                            },
                        },
                    },
                },
            },
        },
    })

    return spec
}
