import React, { ReactElement } from 'react'
import ReactDOMServer from 'react-dom/server';
import Link from 'next/link';
import Image from 'next/image'

import styles from './SearchResultCard.module.css'
import MarkdownDescription from '../MarkdownDescription/MarkdownDescription'

interface Props {
  data: any
  query: string
}

const DATA_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

function ResultCard ( {data, query} : Props ) {
    const title = data.title || data.name
    let linkUrl: string = ''
    if (data.type === 'project') linkUrl = `/project/${data.id}`;
    if (data.type === 'studio') linkUrl = `/profile/${data.slug}`;
    if (data.type === 'resource') linkUrl = data.github_link;

    let linkContainer = (child: ReactElement) => {
        if (data.type === 'resource') return <a href={linkUrl} className={styles.flatAnchor} target={'_blank'}>{child}</a>
        return <Link href={linkUrl} legacyBehavior>{child}</Link>
    }

    return linkContainer(
        <div className={styles.cardContainer}>
        {data.video_1 ? <video className={styles.video} autoPlay loop muted playsInline>
            <source src={`${DATA_URL}/assets/${data.video_1}`} type="video/mp4" />
          </video> 
          : 
          <div className={data.logo ? styles.logo : styles.image}><Image style={{objectFit: 'cover'}} alt='' src={`${DATA_URL}/assets/${data.logo || data.image_1}?key=${data.type === 'profile' ? 'logo' : 'thumb'}`} fill unoptimized/></div>
        }
        <div>
            <div className={styles.name}>
                <div dangerouslySetInnerHTML={{__html: title.replace(new RegExp('(' + query + ')', 'gi'), '<mark>$1</mark>') }} /> 
                {data.profile ? <span className={styles.partner_info}>by
                    <div
                        className={styles.logoMini}
                        style={{
                        background: `url(${DATA_URL}/assets/${data.profile.logo}?key=logo)`,
                        }}
                    />

                    <div className={styles.partner_name}>
                        {data.profile.name}
                    </div>
                </span> : null}
            </div>
            
            <div className={styles.description_container}>
                <div dangerouslySetInnerHTML={{__html: ReactDOMServer.renderToString(<MarkdownDescription className={styles.description} description={data.description} inPartnersList />).replace(new RegExp('(' + query + ')', 'gi'), '<mark>$1</mark>') }} /> 
            </div>
        </div>
        </div>)
}

export default ResultCard
