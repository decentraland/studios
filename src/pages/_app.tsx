import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useMemo } from 'react'
import English from '../locales/en.json'
import { IntlProvider } from 'react-intl'
import React from 'react'
import Head from 'next/head'
import { Footer } from 'decentraland-ui/dist/components/Footer/Footer'
import dynamic from 'next/dynamic'
import Script from 'next/script'

declare global {
  interface Window {
    analytics: any
  }
}

const Navbar = dynamic(() => import('decentraland-ui/dist/components/Navbar/Navbar').then((module) => module.Navbar), {
  ssr: false,
})

const METABASE_KEY = process.env.NEXT_PUBLIC_METABASE_KEY

function App({ Component, pageProps }: AppProps) {
  const [shortLocale] = ['en']
  const messages = useMemo(() => {
    switch (shortLocale) {
      case 'en':
        return English
      default:
        return English
    }
  }, [shortLocale])

  return (
    <>
      <Script id="metabase">
        {`!function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];analytics.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);analytics.push(t);return analytics}};for(var e=0;e<analytics.methods.length;e++){var key=analytics.methods[e];analytics[key]=analytics.factory(key)}analytics.load=function(key,e){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.src="https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n);analytics._loadOptions=e};analytics._writeKey="${METABASE_KEY}";;analytics.SNIPPET_VERSION="4.15.3";
          analytics.load("${METABASE_KEY}");
          analytics.page();
          }}();`}
      </Script>
      <Head>
        <link href="https://ui.decentraland.org/styles.css" rel="stylesheet" />
      </Head>
      <IntlProvider locale={shortLocale} messages={messages}>
        <Navbar />
        <Component {...pageProps} />
        <Footer />
      </IntlProvider>
    </>
  )
}

export default App
