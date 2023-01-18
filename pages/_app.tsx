import '../styles/globals.css'
import 'decentraland-ui/lib/styles.css'
import type { AppProps } from 'next/app'
import { useEffect, useMemo } from 'react'
import English from '../locales/en.json'
import { IntlProvider } from 'react-intl'
import React from 'react'
import { Footer } from 'decentraland-ui/dist/components/Footer/Footer'
import dynamic from 'next/dynamic'
import Script from 'next/script'
import { loadIntercom } from 'next-intercom'
import Head from 'next/head'
import { useRouter } from 'next/router'

declare global {
  interface Window {
    analytics: any
  }
}

const Navbar = dynamic(() => import('decentraland-ui/dist/components/Navbar/Navbar').then((module) => module.Navbar), {
  ssr: false,
})

const METABASE_KEY = process.env.NEXT_PUBLIC_METABASE_KEY
const INTERCOM_APP_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID

function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const [shortLocale] = ['en']
  const messages = useMemo(() => {
    switch (shortLocale) {
      case 'en':
        return English
      default:
        return English
    }
  }, [shortLocale])

  //store a flag for BackButton behaviour
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      globalThis?.sessionStorage.setItem('prevInStudios', url)
    }

    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [])

  const isFullscreen= router.asPath === '/' || router.asPath === '/projects'

  return (
    <>
      <Head>
        <meta name="og:site_name" content="Decentraland" />
        <meta name="description" content="Let’s build the metaverse together. Find the Right Team for Your Project" />
        <meta name="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="og:image" content="/images/decentraland.png" />
        <link rel="icon" href="/favicon.ico" />
      </Head>      
      {loadIntercom({
        appId: INTERCOM_APP_ID,
      })}
      <Script id="metabase">
        {`!function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];analytics.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);analytics.push(t);return analytics}};for(var e=0;e<analytics.methods.length;e++){var key=analytics.methods[e];analytics[key]=analytics.factory(key)}analytics.load=function(key,e){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.src="https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n);analytics._loadOptions=e};analytics._writeKey="${METABASE_KEY}";;analytics.SNIPPET_VERSION="4.15.3";
          analytics.load("${METABASE_KEY}");
          analytics.page();
          }}();`}
      </Script>
      <Script id="plausible"
        data-domain="studios.decentraland.org" 
        src="https://plausible.io/js/script.outbound-links.js">
      </Script>
      <IntlProvider locale={shortLocale} messages={messages}>
        <div className='allocateNav'>
          <Navbar isFullscreen={isFullscreen}/>
        </div>
        <Component {...pageProps} />
        <Footer />
      </IntlProvider>
    </>
  )
}

export default App
