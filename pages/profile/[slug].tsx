import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import Partners from '../../clients/Partners'
import { VerifiedPartner } from '../../interfaces/VerifiedPartner'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import React from 'react'
import PartnerProfile from '../../components/PartnerProfile/PartnerProfile'
import { PartnerProject } from '../../interfaces/PartnerProject'
import Projects from '../../clients/Projects'
import { useIntl } from 'react-intl'

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (params && params.slug) {
    const partner = await Partners.getPartnerData(`?filter[slug]=${params.slug}`)
    const projects = await Projects.getProject(`?filter[profile]=${partner.id}`)

    return {
      props: {
        partner,
        projects,
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

function Partner({ partner, projects }: { partner: VerifiedPartner; projects: PartnerProject[] }) {
  const intl = useIntl()
  const title = intl.formatMessage({ id: 'title' })

  return (
    <Container>
      <Head>
        <title>Metaverse Studios</title>
      </Head>

      <main>
        <PartnerProfile partner={partner} projects={projects} />
      </main>
    </Container>
  )
}

export default Partner
