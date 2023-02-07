import React from 'react'

import Head from 'next/head'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { useIntl } from 'react-intl'
import ReviewVerify from '../../components/ReviewVerify/ReviewVerify'

function ReviewForm() {
  const intl = useIntl()
  const title = intl.formatMessage({ id: 'title' })

  return (
    <Container>
      <Head>
        <meta property="og:title" content="Email verfication link" />
        <meta property="og:description" content={`Metaverse Studios e-mail verfication link`} />
      </Head>

      <main>
        <ReviewVerify />
      </main>
    </Container>
  )
}

export default ReviewForm
