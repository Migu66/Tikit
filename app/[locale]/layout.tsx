import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Navbar } from '@/components/navbar';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Validar que el locale es válido
  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound();
  }

  // Establecer el locale para la request
  setRequestLocale(locale);

  // Obtener mensajes para el locale
  const messages = await getMessages();

  return (
    <div lang={locale} suppressHydrationWarning>
      <NextIntlClientProvider messages={messages}>
        <Navbar />
        <main className="min-h-screen bg-white text-gray-900 transition-colors duration-300">
          {children}
        </main>
      </NextIntlClientProvider>
    </div>
  );
}
