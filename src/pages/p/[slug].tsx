import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import { useIntl } from 'react-intl'
import Partners from '../../clients/Partners'
import { VerifiedPartner } from '../../interfaces/VerifiedPartner'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import React from 'react'
import PartnerProfile from '../../components/PartnerProfile/PartnerProfile'

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const partner = await Partners.getPartnerData(params?.slug as string)

  return {
    props: {
      partner,
    },
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await Partners.getAllSlugs()

  return {
    paths,
    fallback: false,
  }
}

function Partner({ partner }: { partner: VerifiedPartner }) {
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
        <PartnerProfile partner={partner} />
      </main>
    </Container>
  )
}

export default Partner
