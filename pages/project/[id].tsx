import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import { useIntl } from 'react-intl'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import React from 'react'
import ProjectProfile from '../../components/ProjectProfile/ProjectProfile'
import Projects from '../../clients/Projects'
import { PartnerProject } from '../../interfaces/PartnerProject'

const DATA_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (params && params.id) {
    const project = (await Projects.getProject(`?filter[id]=${params.id}&fields=*,profile.name,profile.slug,profile.logo`))[0]

    return {
      props: {
        project
      },
    }
  }

  return {
    props: { error: true },
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await Projects.getIdsAndProfiles()

  return {
    paths,
    fallback: false,
  }
}

interface Props {
  project: PartnerProject
}

function Project({ project }: Props) {
  const intl = useIntl()
  const title = intl.formatMessage({ id: 'title' })

  return (
    <Container>
      <Head>
        <meta property="og:title" content="Let’s build the metaverse together. Find the Right Team for Your Project" />
        <meta property="og:description" content={`${project.title} by ${project.profile.name}`} />
        <meta property="og:image" content={`${DATA_URL}/assets/${project.image_1}?key=meta-link`} />

        <meta property="og:url" content={`https://studios.decentraland.org/project/${project.id}`} />

        <meta property="twitter:url" content={`https://studios.decentraland.org/project/${project.id}`} />
        <meta name="twitter:title" content="Let’s build the metaverse together. Find the Right Team for Your Project" />
        <meta name="twitter:description" content={`${project.title} by ${project.profile.name}`} />
        <meta name="twitter:image" content={`${DATA_URL}/assets/${project.image_1}?key=meta-link`}/>

        <link rel="canonical" href={`https://studios.decentraland.org/project/${project.id}`} />
      </Head>

      <main>
        <ProjectProfile project={project} />
      </main>
    </Container>
  )
}

export default Project
