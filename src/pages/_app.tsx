import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import English from '../locales/en.json'
import { IntlProvider } from 'react-intl'
import React from 'react'
import Head from 'next/head'
import { Footer } from 'decentraland-ui/dist/components/Footer/Footer'
import dynamic from 'next/dynamic'

const Navbar = dynamic(() => import('decentraland-ui/dist/components/Navbar/Navbar').then((module) => module.Navbar), {
  ssr: false,
})

function App({ Component, pageProps }: AppProps) {
  const { locale } = useRouter()
  const [shortLocale] = locale ? locale.split('-') : ['en']
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
