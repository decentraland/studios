import React, { ReactElement } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import rehypeRaw from 'rehype-raw'
import DOMPurify from "dompurify"

import styles from './SearchResultCard.module.css'
import MarkdownDescription from '../MarkdownDescription/MarkdownDescription'
import { SearchResult } from '../../interfaces/SearchResult';

interface Props {
    data: SearchResult
    query: string
}

const DATA_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

function ResultCard({ data, query }: Props) {
    const title = data.title || data.name
    let linkUrl: string = ''
    if (data.type === 'project') linkUrl = `/project/${data.id}`;
    if (data.type === 'studio') linkUrl = `/profile/${data.slug}`;
    if (data.type === 'resource') linkUrl = data.github_link;

    let linkContainer = (child: ReactElement) => {
        if (data.type === 'resource') return child
        return <Link href={linkUrl} legacyBehavior passHref>{child}</Link>
    }

    const playVideo = (e: any) => {
        if (data.video_1){
            e.currentTarget.children[0].play()
        }
    }

    const pauseVideo = (e: any) => {
        if (data.video_1){
            e.currentTarget.children[0].pause()
            e.currentTarget.children[0].currentTime = 0
        }
    }

    return linkContainer(
        <div className={`${styles.cardContainer} ${styles['cardContainer--resource']}`} 
            onMouseEnter={playVideo} 
            onMouseLeave={pauseVideo}>
            {data.video_1 ? <video className={styles.image} loop muted playsInline preload='metadata'>
                <source src={`${DATA_URL}/assets/${data.video_1}#t=0.001`} type="video/mp4" />
            </video>
                :
                (data.logo ?
                    <div className={styles.logo}><Image alt='' src={`${DATA_URL}/assets/${data.logo || data.image_1}?key=${data.type === 'studio' ? 'logo' : 'thumb'}`} fill unoptimized /></div>
                    :
                    <div className={styles.image}><Image style={{ objectFit: 'cover' }} alt='' src={`${DATA_URL}/assets/${data.logo || data.image_1}?key=${data.type === 'studio' ? 'logo' : 'thumb'}`} fill unoptimized /></div>
                )}
            <div className={styles.infoContainer}>
                <div className={styles.name}>
                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(title.replace(new RegExp('(' + query + ')', 'gi'), '<mark>$1</mark>')) }} />
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
                    <MarkdownDescription className={`${styles.description} ${data.type === 'resource' ? styles['description--resource'] : ''}`} description={data.description.replace(new RegExp('(' + query + ')', 'gi'), '<mark>$1</mark>')} inPartnersList rehypePlugins={[rehypeRaw]} />
                </div>
                {data.type === 'resource' && <div className={styles.buttons}>
                    {data.play_link && <a className='button_primary--inverted button--small' href={data.play_link} target='_blank' rel="noreferrer">TRY IT NOW</a>}
                    {data.github_link && <a className='button_basic button--small' href={data.github_link} target='_blank' rel="noreferrer">VIEW CODE</a>}
                </div>}
            </div>
        </div>)
}

export default ResultCard
