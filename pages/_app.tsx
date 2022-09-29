import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import English from "../locales/en.json"
import { IntlProvider } from 'react-intl'

function MyApp({ Component, pageProps }: AppProps) {
  const { locale } = useRouter()
  const [ shortLocale ] = locale ? locale.split('-') : ['en']
  const messages = useMemo(() => {
    switch (shortLocale) {
        case "en":
            return English
        default:
            return English
    }
}, [shortLocale])
  return (
    <IntlProvider
      locale={shortLocale}
      messages={messages}
    >
      <Component {...pageProps} />
    </IntlProvider>
  )
}

export default MyApp
