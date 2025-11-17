/**
 * Configuración personalizada de la UI de Swagger
 */

export const swaggerUIConfig = {
    // Configuración de layout
    layout: 'BaseLayout' as const,

    // Mostrar todas las operaciones por defecto
    docExpansion: 'list' as const,

    // Profundidad de modelos a mostrar
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 3,

    // Mostrar request duration
    displayRequestDuration: true,

    // Habilitar filtrado
    filter: true,

    // Mostrar extensiones de vendor
    showExtensions: true,

    // Mostrar valores comunes
    showCommonExtensions: true,

    // Sintaxis highlighting
    syntaxHighlight: {
        activate: true,
        theme: 'monokai' as const,
    },

    // Intentar ejecutar peticiones
    tryItOutEnabled: true,

    // Persistir autorización
    persistAuthorization: true,

    // URL de validación (deshabilitado para desarrollo local)
    validatorUrl: null as any,
}

/**
 * CSS personalizado para Swagger UI
 */
export const customSwaggerCSS = `
  .swagger-ui {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
  }

  .swagger-ui .topbar {
    background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
    padding: 20px 0;
  }

  .swagger-ui .topbar .download-url-wrapper {
    display: none;
  }

  .swagger-ui .info .title {
    color: #1f2937;
    font-size: 2.5rem;
    font-weight: 700;
  }

  .swagger-ui .info .description p {
    color: #4b5563;
    font-size: 1rem;
    line-height: 1.6;
  }

  .swagger-ui .opblock-tag {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
    border-bottom: 2px solid #e5e7eb;
    padding: 15px 0;
    margin: 30px 0 15px 0;
  }

  .swagger-ui .opblock {
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    margin-bottom: 15px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }

  .swagger-ui .opblock.opblock-get {
    border-color: #3b82f6;
    background: rgba(59, 130, 246, 0.05);
  }

  .swagger-ui .opblock.opblock-post {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.05);
  }

  .swagger-ui .opblock.opblock-put {
    border-color: #f59e0b;
    background: rgba(245, 158, 11, 0.05);
  }

  .swagger-ui .opblock.opblock-delete {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.05);
  }

  .swagger-ui .opblock .opblock-summary-method {
    font-weight: 600;
    border-radius: 4px;
    padding: 6px 15px;
  }

  .swagger-ui .btn.execute {
    background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 10px 30px;
    font-weight: 600;
    transition: all 0.2s;
  }

  .swagger-ui .btn.execute:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }

  .swagger-ui .response .response-col_status {
    font-weight: 600;
  }

  .swagger-ui .response-col_status .response-undocumented {
    color: #ef4444;
  }

  .swagger-ui .parameter__name {
    font-weight: 600;
    color: #1f2937;
  }

  .swagger-ui .parameter__type {
    color: #6b7280;
    font-size: 0.875rem;
  }

  .swagger-ui table thead tr td,
  .swagger-ui table thead tr th {
    font-weight: 600;
    color: #1f2937;
    border-bottom: 2px solid #e5e7eb;
  }

  .swagger-ui .scheme-container {
    background: #f9fafb;
    border-radius: 8px;
    padding: 20px;
    margin: 20px 0;
  }

  .swagger-ui .model-box {
    background: #f9fafb;
    border-radius: 6px;
    padding: 15px;
  }

  .swagger-ui .model-title {
    color: #1f2937;
    font-weight: 600;
  }

  .swagger-ui .property-row .prop-type {
    color: #2563eb;
  }

  /* Scrollbar personalizado */
  .swagger-ui ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .swagger-ui ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  .swagger-ui ::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
    border-radius: 4px;
  }

  .swagger-ui ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #1d4ed8 0%, #7e22ce 100%);
  }
`
