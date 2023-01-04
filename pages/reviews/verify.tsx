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
        <title>{title}</title>
        <meta name="description" content="Verified Partners" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <ReviewVerify />
      </main>
    </Container>
  )
}

export default ReviewForm
