import React from 'react'

import Head from 'next/head'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import ReviewVerify from '../../components/ReviewVerify/ReviewVerify'

function ReviewForm() {
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
