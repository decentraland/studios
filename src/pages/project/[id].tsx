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
  const paths = await Projects.getAllIds()
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
        <title>{title}</title>
        <meta name="description" content="Verified Partners" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {/* {JSON.stringify(project)} */}
        <ProjectProfile project={project} partner={partner} />
        {/* <PartnerProfile partner={partner} projects={projects}/> */}
      </main>
    </Container>
  )
}

export default Project