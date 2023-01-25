import React from 'react'

import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import Partners from '../../../clients/Partners'
import { VerifiedPartner } from '../../../interfaces/VerifiedPartner'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import ReviewSubmitForm from '../../../components/ReviewSubmitForm/ReviewSubmitForm'
import { useIntl } from 'react-intl'

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (params && params.slug) {
    const partner = await Partners.getPartnerData(`?filter[slug]=${params.slug}`)

    return {
      props: {
        partner,
      },
    }
  }

  return {
    props: { error: true },
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await Partners.getAllSlugs()

  return {
    paths,
    fallback: false,
  }
}

function ReviewForm({ partner }: { partner: VerifiedPartner }) {
  const intl = useIntl()
  const title = intl.formatMessage({ id: 'title' })

  return (
    <Container>
      <Head>
        <meta property="og:title" content="Let’s build the metaverse together. Find the Right Team for Your Project" />
        <meta property="og:description" content={`Leave a review to ${partner.name} studio`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <ReviewSubmitForm partner={partner} />
      </main>
    </Container>
  )
}

export default ReviewForm
