import { GetServerSideProps, GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import Partners from '../../clients/Partners'
import { VerifiedPartner } from '../../interfaces/VerifiedPartner'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import React, { useEffect, useState } from 'react'
import PartnerProfile from '../../components/PartnerProfile/PartnerProfile'
import { PartnerProject } from '../../interfaces/PartnerProject'
import Projects from '../../clients/Projects'
import { useIntl } from 'react-intl'
import { PartnerReview } from '../../interfaces/PartnerReview'

const DATA_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (params && params.slug) {
    const partner = await Partners.getPartnerData(`?filter[slug]=${params.slug}`)
    const projects = await Projects.getProject(`?filter[profile]=${partner.id}`)
    const reviews = await Partners.getReviews(partner.id)
    
    

    return {
      props: {
        partner,
        projects,
        reviews,
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
    paths,
    fallback: false,
  }
}

interface Props {
  partner: VerifiedPartner
  projects: PartnerProject[]
  reviews: PartnerReview[]
}

function Partner({ partner, projects, reviews }: Props) {
  const intl = useIntl()
  const title = intl.formatMessage({ id: 'title' })

  const [updatedReviews, setUpdatedReviews] = useState(reviews)

  useEffect(() => {
    if (partner.id){

      fetch(`/api/reviews/get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ partnerId: partner.id })
      }).then((response) => response.json()).then((data) => setUpdatedReviews(data))
    }

  },[partner.id])
  
  return (
    <Container>
      <Head>
        <meta property="og:title" content="Let’s build the metaverse together. Find the Right Team for Your Project" />
        <meta property="og:description" content={`Profile of ${partner.name} studio`} />
        <meta property="og:image" content={`${DATA_URL}/assets/${partner.logo}?key=meta-link`} />
      </Head>

      <main>
        <PartnerProfile partner={partner} projects={projects} reviews={updatedReviews}/>
      </main>
    </Container>
  )
}

export default Partner
