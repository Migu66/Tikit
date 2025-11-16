import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { StatsData } from '@/types/stats'

interface TicketProduct {
    id: string
    name: string
    quantity: number
    unitPrice: number
    totalPrice: number
}

interface TicketData {
    id: string
    storeName: string
    category: string | null
    totalAmount: number
    tax: number
    purchaseDate: Date
    products: TicketProduct[]
}

interface ExportOptions {
    stats: StatsData
    periodLabel: string
    tickets: TicketData[]
    translations: {
        title: string
        period: string
        overview: {
            title: string
            totalSpent: string
            ticketsCount: string
            averageTicket: string
        }
        byCategory: {
            title: string
            category: string
            amount: string
            percentage: string
        }
        trends: {
            title: string
            month: string
            spending: string
            tickets: string
        }
        topStores: {
            title: string
            store: string
            visits: string
            total: string
        }
        ticketsDetail: {
            title: string
            date: string
            store: string
            category: string
            total: string
            products: string
            quantity: string
            unitPrice: string
            price: string
        }
    }
}

/**
 * Exporta las estadísticas a un archivo PDF con detalles de tickets
 */
export function exportToPDF(options: ExportOptions): void {
    const { stats, periodLabel, tickets, translations } = options

    // Crear documento PDF
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    let yPosition = 20

    // Título principal
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text(translations.title, pageWidth / 2, yPosition, { align: 'center' })

    yPosition += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(
        `${translations.period}: ${periodLabel}`,
        pageWidth / 2,
        yPosition,
        { align: 'center' }
    )

    yPosition += 15

    // Resumen general
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(translations.overview.title, 14, yPosition)
    yPosition += 10

    const overviewData = [
        [
            translations.overview.totalSpent,
            `€${stats.overview.totalSpent.toFixed(2)}`,
        ],
        [
            translations.overview.ticketsCount,
            stats.overview.periodTicketsCount.toString(),
        ],
        [
            translations.overview.averageTicket,
            `€${stats.overview.averagePerTicket.toFixed(2)}`,
        ],
    ]

    autoTable(doc, {
        startY: yPosition,
        head: [],
        body: overviewData,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] },
        margin: { left: 14, right: 14 },
    })

    yPosition = (doc as any).lastAutoTable.finalY + 15

    // Gastos por categoría
    if (stats.byCategory.length > 0) {
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text(translations.byCategory.title, 14, yPosition)
        yPosition += 10

        const categoryData = stats.byCategory.map((cat) => [
            cat.category,
            `€${cat.amount.toFixed(2)}`,
            `${cat.percentage.toFixed(1)}%`,
        ])

        autoTable(doc, {
            startY: yPosition,
            head: [
                [
                    translations.byCategory.category,
                    translations.byCategory.amount,
                    translations.byCategory.percentage,
                ],
            ],
            body: categoryData,
            theme: 'striped',
            headStyles: { fillColor: [99, 102, 241] },
            margin: { left: 14, right: 14 },
        })

        yPosition = (doc as any).lastAutoTable.finalY + 15
    }

    // Verificar si necesitamos una nueva página
    if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
    }

    // Tendencias mensuales
    if (stats.monthlyTrends.length > 0) {
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text(translations.trends.title, 14, yPosition)
        yPosition += 10

        const trendsData = stats.monthlyTrends.map((trend) => [
            trend.month,
            `€${trend.amount.toFixed(2)}`,
            trend.ticketsCount.toString(),
        ])

        autoTable(doc, {
            startY: yPosition,
            head: [
                [
                    translations.trends.month,
                    translations.trends.spending,
                    translations.trends.tickets,
                ],
            ],
            body: trendsData,
            theme: 'striped',
            headStyles: { fillColor: [99, 102, 241] },
            margin: { left: 14, right: 14 },
        })

        yPosition = (doc as any).lastAutoTable.finalY + 15
    }

    // Verificar si necesitamos una nueva página
    if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
    }

    // Comercios frecuentes
    if (stats.topStores.length > 0) {
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text(translations.topStores.title, 14, yPosition)
        yPosition += 10

        const storesData = stats.topStores.map((store) => [
            store.store,
            store.visits.toString(),
            `€${store.total.toFixed(2)}`,
        ])

        autoTable(doc, {
            startY: yPosition,
            head: [
                [
                    translations.topStores.store,
                    translations.topStores.visits,
                    translations.topStores.total,
                ],
            ],
            body: storesData,
            theme: 'striped',
            headStyles: { fillColor: [99, 102, 241] },
            margin: { left: 14, right: 14 },
        })

        yPosition = (doc as any).lastAutoTable.finalY + 15
    }

    // Nueva página para detalles de tickets
    if (tickets.length > 0) {
        doc.addPage()
        yPosition = 20

        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.text(translations.ticketsDetail.title, pageWidth / 2, yPosition, {
            align: 'center',
        })
        yPosition += 15

        // Iterar sobre cada ticket
        tickets.forEach((ticket, index) => {
            // Verificar si necesitamos una nueva página antes de cada ticket
            if (yPosition > 240) {
                doc.addPage()
                yPosition = 20
            }

            // Información del ticket
            doc.setFontSize(12)
            doc.setFont('helvetica', 'bold')
            const ticketDate = new Date(
                ticket.purchaseDate
            ).toLocaleDateString()
            doc.text(`Ticket #${index + 1}`, 14, yPosition)
            yPosition += 7

            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            doc.text(
                `${translations.ticketsDetail.date}: ${ticketDate}`,
                14,
                yPosition
            )
            yPosition += 5
            doc.text(
                `${translations.ticketsDetail.store}: ${ticket.storeName}`,
                14,
                yPosition
            )
            yPosition += 5
            if (ticket.category) {
                doc.text(
                    `${translations.ticketsDetail.category}: ${ticket.category}`,
                    14,
                    yPosition
                )
                yPosition += 5
            }
            doc.text(
                `${
                    translations.ticketsDetail.total
                }: €${ticket.totalAmount.toFixed(2)}`,
                14,
                yPosition
            )
            yPosition += 8

            // Tabla de productos
            if (ticket.products.length > 0) {
                const productsData = ticket.products.map((product) => [
                    product.name,
                    product.quantity.toString(),
                    `€${product.unitPrice.toFixed(2)}`,
                    `€${product.totalPrice.toFixed(2)}`,
                ])

                autoTable(doc, {
                    startY: yPosition,
                    head: [
                        [
                            translations.ticketsDetail.products,
                            translations.ticketsDetail.quantity,
                            translations.ticketsDetail.unitPrice,
                            translations.ticketsDetail.price,
                        ],
                    ],
                    body: productsData,
                    theme: 'grid',
                    headStyles: { fillColor: [99, 102, 241], fontSize: 9 },
                    bodyStyles: { fontSize: 8 },
                    margin: { left: 14, right: 14 },
                    styles: { cellPadding: 2 },
                })

                yPosition = (doc as any).lastAutoTable.finalY + 10
            }
        })
    }

    // Guardar PDF
    doc.save(`estadisticas_${new Date().getTime()}.pdf`)
}
