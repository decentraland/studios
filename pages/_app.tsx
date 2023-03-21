import 'decentraland-ui/lib/styles.css'
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect, useMemo } from 'react'
import English from '../locales/en.json'
import { IntlProvider } from 'react-intl'
import React from 'react'
import { Footer } from 'decentraland-ui/dist/components/Footer/Footer'
import dynamic from 'next/dynamic'
import Script from 'next/script'
import Head from 'next/head'
import { useRouter } from 'next/router'
import NavTabs from '../components/NavTabs/NavTabs'

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

const tabsContents = [['/', 'Studios'],['/projects', 'Projects'], ['/resources', 'Resources'], ['/jobs', 'Jobs']]


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
      
      if (navHist.at(-1) !== url){
        navHist.push(url)
        globalThis.sessionStorage.setItem('navHist', JSON.stringify(navHist));
      }

      
      (globalThis as any).fbq('track', 'PageView')
    }

    router.events.on('routeChangeStart', handleRouteChange)

    //initialize navHist on first pageView
    if (!globalThis.sessionStorage.navHist){
      globalThis.sessionStorage.setItem('navHist', JSON.stringify([router.asPath]));
    }

    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
    }
  }, [router.events])

  const isMetaverseGuide = router.asPath.includes('/p/')
  // const showTabs = [...tabsContents, ['/search']].map(tab => tab[0]).includes(router.route)
  const showTabs = !['/p/', '/project/', '/profile/'].includes(router.route)
  
  return (
    <>
      <Head>
        <meta property="og:site_name" content="Decentraland Studios" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="studios.decentraland.org" />
        <meta name="twitter:card" content="summary" />
        <link rel="icon" href="/favicon.ico" />
        <title>Decentraland Studios</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />

        <meta name="google-site-verification" content="GsC7SYvV1UMqj0g5_0rWEMvTcp474fn8vKtSHQaZIm8" />
        
        <noscript>
          <img height="1" width="1" style={{display:"none"}}
            src={"https://www.facebook.com/tr?id=486890793629175&ev=PageView&noscript=1"}
          />
        </noscript>
      </Head>

      {isMetaverseGuide ? 
        <Component {...pageProps} />
        :
        <IntlProvider locale={shortLocale} messages={messages}>
          <div className='allocateNav'>
            <Navbar isFullscreen={showTabs} />
          </div>
          {showTabs && <NavTabs tabsContents={tabsContents} />}
          <Component {...pageProps} />
          <Footer />
        </IntlProvider>}

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
      <Script id="intercom" strategy="lazyOnload">
        {`window.intercomSettings = {
            api_base: "https://api-iam.intercom.io",
            app_id: "${INTERCOM_APP_ID}",
            hide_default_launcher: ${isMetaverseGuide}
        };`}
        {`(function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/ht3lxko9';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();`}
      </Script>
      <Script id="fb-pixel" strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html:
            `!function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '486890793629175');
        fbq('track', 'PageView');`}}
      />
    </>
  )
}

export default App
