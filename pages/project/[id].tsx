import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import { useIntl } from 'react-intl'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import React from 'react'
import ProjectProfile from '../../components/ProjectProfile/ProjectProfile'
import Partners from '../../clients/Partners'
import { VerifiedPartner } from '../../interfaces/VerifiedPartner'
import Projects from '../../clients/Projects'
import { PartnerProject } from '../../interfaces/PartnerProject'

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (params && params.id) {
    const project = (await Projects.getProject(`?filter[id]=${params.id}`))[0]
    const partner = await Partners.getPartnerData(`?filter[id]=${project['profile']}`)

    return {
      props: {
        project,
        partner,
      },
    }
  }

  return {
    props: { error: true },
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const projects = await Projects.getIdsAndProfiles()
  const paths = []

  const partnerIds = (await Partners.getAllIds()).map((partner) => partner.params.id)

  for (const project of projects) {
    if (partnerIds.includes(parseInt(project.params.profile))) {
      paths.push(project)
    }
  }

  return {
    paths,
    fallback: false,
  }
}

function Project({ project, partner }: { project: PartnerProject; partner: VerifiedPartner }) {
  const intl = useIntl()
  const title = intl.formatMessage({ id: 'title' })

  return (
    <Container>
      <Head>
        <title>Metaverse Studios</title>
        {/* <meta name="description" content="Verified Partners" />
        <link rel="icon" href="/favicon.ico" /> */}
      </Head>

      <main>
        <ProjectProfile project={project} partner={partner} />
      </main>
    </Container>
  )
}

export default Project
