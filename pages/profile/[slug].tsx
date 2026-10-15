import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import Partners from '../../clients/Partners'
import { EMPTY_PATH_PLACEHOLDER, withPlaceholderIfEmpty } from '../../lib/staticPaths'
import { VerifiedPartner } from '../../interfaces/VerifiedPartner'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import React from 'react'
import PartnerProfile from '../../components/PartnerProfile/PartnerProfile'

const DATA_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (params?.slug === EMPTY_PATH_PLACEHOLDER) return { notFound: true }
  if (params && params.slug) {
    const partner = await Partners.getPartnerData({ slug: params.slug })

    return {
      props: {
        partner
      }
    }
  }

  return {
    props: { error: true },
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await Partners.getAllSlugs()

  return {
    paths: withPlaceholderIfEmpty(paths, 'slug'),
    fallback: false,
  }
}

interface Props {
  partner: VerifiedPartner
}

function Partner({ partner }: Props) {
  
  return (
    <Container>
      <Head>
        <meta property="og:title" content="Let’s build the metaverse together. Find the Right Team for Your Project" />
        <meta property="og:description" content={`Profile of ${partner.name} studio`} />
        <meta property="og:image" content={`${DATA_URL}/assets/${partner.logo}?key=meta-link`} />

        <meta property="og:url" content={`https://studios.decentraland.org/profile/${partner.slug}`} />

        <meta property="twitter:url" content={`https://studios.decentraland.org/profile/${partner.slug}`} />
        <meta name="twitter:title" content="Let’s build the metaverse together. Find the Right Team for Your Project" />
        <meta name="twitter:description" content={`Profile of ${partner.name} studio`} />
        <meta name="twitter:image" content={`${DATA_URL}/assets/${partner.logo}?key=meta-link`}/>

        <link rel="canonical" href={`https://studios.decentraland.org/profile/${partner.slug}`} />
      </Head>

      <main>
        <PartnerProfile partner={partner}/>
      </main>
    </Container>
  )
}

export default Partner
