// import 'decentraland-ui/lib/styles.css'

//testing lightweight version of 'decentraland-ui/lib/styles.css'
import 'semantic-ui-css/semantic.min.css'
// import 'balloon-css/balloon.min.css'
import 'decentraland-ui/dist/themes/base-theme.css'
import 'decentraland-ui/dist/themes/alternative/light-theme.css'

import '../styles/globals.css'
import React, { useState } from 'react'
import type { AppProps } from 'next/app'
import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import Script from 'next/script'
import Head from 'next/head'
import { IntlProvider } from 'react-intl'

import English from '../locales/en.json'
import NavTabs from '../components/NavTabs/NavTabs'
import { fbq, updateIntercom } from '../components/utils'
import { ISBOT_INTEGRITY, ISBOT_SRC, fbPixelInit, googleTagInit, intercomInit, plausibleInit, segmentInit } from '../lib/inlineScripts'
import FooterStudios from '../components/FooterStudios/FooterStudios'
import Cookies from 'js-cookie'
import { User } from '../interfaces/User'

declare global {
  interface Window {
    analytics: any
  }
}

const Navbar = dynamic(() => import('decentraland-ui/dist/components/Navbar/Navbar').then((module) => module.Navbar), {
  ssr: false,
})

const Footer = dynamic(() => import('decentraland-ui/dist/components/Footer/Footer').then((module) => module.Footer), {
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

  useEffect(() => {

    const handleRouteChange = (url: string) => {
      //sessionStorage for back button behaviour
      let navHist = JSON.parse(globalThis.sessionStorage.navHist || '[]')

      if (navHist.at(-1) !== url) {
        navHist.push(url)
        globalThis.sessionStorage.setItem('navHist', JSON.stringify(navHist));
      }

      fbq('track', 'PageView')
    }

    router.events.on('routeChangeStart', handleRouteChange)

    //initialize navHist on first pageView
    if (!globalThis.sessionStorage.navHist) {
      globalThis.sessionStorage.setItem('navHist', JSON.stringify([router.asPath]));
    }

    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
    }
  }, [router.events])

  const isCustomLanding = router.asPath.includes('/p/')

  // The Intercom snippet only runs on the first page load (next/script dedupes it by id), so the launcher visibility
  // is updated when client-side navigation enters or leaves a custom landing
  useEffect(() => {
    updateIntercom({ hide_default_launcher: isCustomLanding })
  }, [isCustomLanding])

  const showTabs = !['/p/', '/project/', '/profile/', '/signup', '/jobs/verify'].includes(router.route)
  const showFooter = !['/signup', '/jobs/verify'].includes(router.route)

  return (
    <>
      <Head>
        <title>Decentraland Studios</title>
        <link rel="icon" href="/favicon.ico" />

        <meta property="og:site_name" content="Decentraland Studios" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://studios.decentraland.org" />
        <meta property="twitter:url" content="https://studios.decentraland.org/" />
        <meta property="twitter:domain" content="studios.decentraland.org" />
        <meta name="twitter:card" content="summary_large_image" />

        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />

        <meta name="google-site-verification" content="GsC7SYvV1UMqj0g5_0rWEMvTcp474fn8vKtSHQaZIm8" />

        <noscript>
          <img height="1" width="1" style={{ display: "none" }}
            src={"https://www.facebook.com/tr?id=486890793629175&ev=PageView&noscript=1"}
          />
        </noscript>
      </Head>

      {isCustomLanding ?
        <>
          <Component {...pageProps} />
          <FooterStudios />
        </>
        :
        <IntlProvider locale={shortLocale} messages={messages}>
          <div className='allocateNav'>
            <Navbar isFullscreen={showTabs} />
          </div>
          {showTabs && <NavTabs />}
          <Component {...pageProps} />
          {showFooter && <FooterStudios />}
          <Footer />
        </IntlProvider>}

      <Script id="google-tag"
        src="https://www.googletagmanager.com/gtag/js?id=G-B0CSXD2KZL">
      </Script>
      <Script id="google-tag-init">
        {googleTagInit()}
      </Script>

      <Script id="isbot-lib"
        src={ISBOT_SRC}
        integrity={ISBOT_INTEGRITY}
        crossOrigin="anonymous">
      </Script>

      <Script id="metabase" >
        {segmentInit(METABASE_KEY)}
      </Script>

      <Script id="plausible"
        data-domain="studios.decentraland.org"
        src="https://plausible.io/js/script.outbound-links.tagged-events.js">
      </Script>
      <Script id='plausible-init' strategy="beforeInteractive">
        {plausibleInit()}
      </Script>

      <Script id='intercom'>
        {intercomInit(INTERCOM_APP_ID, isCustomLanding)}
      </Script>

      <Script id="fb-pixel">
        {fbPixelInit()}
      </Script>
    </>
  )
}

export default App
