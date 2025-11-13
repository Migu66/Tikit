'use client';

import { useTranslations } from 'next-intl';
import { Scan, Brain, BarChart3, Globe } from 'lucide-react';
import { HeroSection } from '@/components/landing/hero-section';
import { FeatureCard } from '@/components/landing/feature-card';
import { ShowcaseSection } from '@/components/landing/showcase-section';
import { FinalCTASection } from '@/components/landing/final-cta-section';
import { Footer } from '@/components/footer';

export default function Home() {
  const t = useTranslations('home');

  const handleGetStarted = () => {
    // TODO: Navigate to signup/login page
    console.log('Get started clicked');
  };

  return (
    <>
      <main className="bg-gray-100">
        {/* Hero Section */}
        <HeroSection
          title={t('hero.title')}
          subtitle={t('hero.subtitle')}
          description={t('hero.description')}
          ctaPrimary={t('hero.cta')}
          onCtaPrimary={handleGetStarted}
        />

        {/* Features Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-linear-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
              {t('features.title')}
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Scan className="h-8 w-8 text-blue-700 dark:text-blue-400" />}
              title={t('features.ocr.title')}
              description={t('features.ocr.description')}
              index={0}
            />
            <FeatureCard
              icon={<Brain className="h-8 w-8 text-purple-700 dark:text-purple-400" />}
              title={t('features.classification.title')}
              description={t('features.classification.description')}
              index={1}
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8 text-green-700 dark:text-green-400" />}
              title={t('features.dashboard.title')}
              description={t('features.dashboard.description')}
              index={2}
            />
            <FeatureCard
              icon={<Globe className="h-8 w-8 text-orange-700 dark:text-orange-400" />}
              title={t('features.multilang.title')}
              description={t('features.multilang.description')}
              index={3}
            />
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <ShowcaseSection
        title={t('showcase.title')}
        subtitle={t('showcase.subtitle')}
        description={t('showcase.description')}
        features={[
          t('showcase.feature1'),
          t('showcase.feature2'),
          t('showcase.feature3'),
        ]}
      />

        {/* Final CTA Section */}
        <FinalCTASection
          title={t('cta.title')}
          subtitle={t('cta.subtitle')}
          buttonText={t('cta.button')}
          trustIndicator1={t('cta.trustIndicator1')}
          trustIndicator2={t('cta.trustIndicator2')}
          trustIndicator3={t('cta.trustIndicator3')}
          onButtonClick={handleGetStarted}
        />
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
