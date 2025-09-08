import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <main className="lg:relative" role="main">
        <div className="mx-auto max-w-7xl w-full pt-16 pb-20 text-center lg:py-48 lg:text-left">
          <div className="px-4 lg:w-1/2 sm:px-8 xl:pr-16">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
              <span className="block xl:inline">{t('homeTitle')}</span>{' '}
              <span className="block text-primary-600 xl:inline">{t('appName')}</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-lg text-gray-500 sm:text-xl md:mt-5 md:max-w-3xl">
              {t('homeSubtitle')}
            </p>
            <div className="mt-10 sm:flex sm:justify-center lg:justify-start" role="group" aria-label="Action buttons">
              <div className="rounded-md shadow">
                <Link
                  to="/report"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 md:py-4 md:text-lg md:px-10"
                  aria-describedby="submit-report-desc"
                >
                  {t('submitReport')}
                </Link>
                <div id="submit-report-desc" className="sr-only">
                  Navigate to the report submission form to submit an anonymous incident report
                </div>
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-3">
                <Link
                  to="/dashboard"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 md:py-4 md:text-lg md:px-10"
                  aria-describedby="view-dashboard-desc"
                >
                  {t('viewDashboard')}
                </Link>
                <div id="view-dashboard-desc" className="sr-only">
                  View the dashboard showing statistics and insights from submitted reports
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative w-full h-64 sm:h-72 md:h-96 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 lg:h-full">
          <img
            className="absolute inset-0 w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
            alt="People working together collaboratively representing community empowerment"
          />
        </div>
      </main>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 overflow-hidden" aria-labelledby="features-heading">
        <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 lg:max-w-7xl">
          <div className="relative">
            <h2 id="features-heading" className="text-center text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {t('featuresTitle')}
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-center text-xl text-gray-500">
              {t('featuresSubtitle')}
            </p>
          </div>

          <div className="relative mt-12 lg:mt-24 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div className="relative">
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl">
                {t('feature1Title')}
              </h3>
              <p className="mt-3 text-lg text-gray-500">
                {t('feature1Text')}
              </p>
            </div>

            <div className="mt-10 -mx-4 relative lg:mt-0" aria-hidden="true">
              <div className="flex justify-center items-center h-32">
                <i className="fas fa-user-secret text-8xl text-primary-400" aria-hidden="true"></i>
              </div>
            </div>
          </div>

          <div className="relative mt-12 sm:mt-16 lg:mt-24">
            <div className="lg:grid lg:grid-flow-row-dense lg:grid-cols-2 lg:gap-8 lg:items-center">
              <div className="lg:col-start-2">
                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl">
                  {t('feature2Title')}
                </h3>
                <p className="mt-3 text-lg text-gray-500">
                  {t('feature2Text')}
                </p>
              </div>

              <div className="mt-10 -mx-4 relative lg:mt-0 lg:col-start-1" aria-hidden="true">
                <div className="flex justify-center items-center h-32">
                  <i className="fas fa-chart-bar text-8xl text-primary-400" aria-hidden="true"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 bg-white" aria-labelledby="how-it-works-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 id="how-it-works-heading" className="text-base text-primary-600 font-semibold tracking-wide uppercase">{t('howItWorksTitle')}</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
              {t('howItWorksSubtitle')}
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3" role="list">
            <div className="flex flex-col items-center text-center" role="listitem">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white" aria-hidden="true">
                <i className="fas fa-mouse-pointer"></i>
              </div>
              <h3 className="mt-5 text-lg font-medium text-gray-900">{t('step1Title')}</h3>
              <p className="mt-2 text-base text-gray-500">{t('step1Text')}</p>
            </div>
            <div className="flex flex-col items-center text-center" role="listitem">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white" aria-hidden="true">
                <i className="fas fa-keyboard"></i>
              </div>
              <h3 className="mt-5 text-lg font-medium text-gray-900">{t('step2Title')}</h3>
              <p className="mt-2 text-base text-gray-500">{t('step2Text')}</p>
            </div>
            <div className="flex flex-col items-center text-center" role="listitem">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white" aria-hidden="true">
                <i className="fas fa-paper-plane"></i>
              </div>
              <h3 className="mt-5 text-lg font-medium text-gray-900">{t('step3Title')}</h3>
              <p className="mt-2 text-base text-gray-500">{t('step3Text')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-gray-50" aria-labelledby="cta-heading">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 id="cta-heading" className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">{t('ctaTitle')}</span>
            <span className="block text-primary-600">{t('ctaSubtitle')}</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/report"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                aria-describedby="final-cta-desc"
              >
                {t('submitReport')}
              </Link>
              <div id="final-cta-desc" className="sr-only">
                Submit an anonymous report to help build a safer community
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
