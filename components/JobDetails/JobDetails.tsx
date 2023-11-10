import React from 'react'

import styles from './JobDetails.module.css'

import MarkdownDescription from '../MarkdownDescription/MarkdownDescription'
import { Job as JobDetails } from '../../interfaces/Job'
import IconFile from '../Icons/IconFile'
import { budgetToRanges } from '../utils'

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

interface Props {
    jobData: JobDetails
    children?: JSX.Element
}

function JobDetails({ jobData, children }: Props) {

    const data = {...jobData} as any

    if (typeof(data.short_description) === 'object') data.short_description = data.short_description.join('\n')

    return (
        <div className={styles.dataContainer}>
            <div className={styles.postedBy}>created by <b>{data.author_name}</b>{data.company && <> from <b>{data.company}</b></>}</div>
            <div className={styles.title}>{data.title}</div>
            <div className={styles.infoTitle}>SHORT DESCRIPTION</div>
            <div className={styles.description}>{data.short_description}</div>
            <div className={styles.infoTitle}>FULL DESCRIPTION</div>
            <MarkdownDescription className={styles.description} description={data.long_description} />

            {data.brief_file && <>
                <div className={styles.infoTitle}>BRIEF FILE</div>
                <a className={styles.link} href={`${DB_URL}/assets/${data.brief_file.id}`} rel="noreferrer" target='_blank'><IconFile red /> {data.brief_file.filename_download}</a>
            </>}

            <div className={styles.infoTitle}>BUDGET</div>
            <div className={styles.description}>{budgetToRanges(data.budget)}</div>

            {data.deadline_date && <>
                <div className={styles.infoTitle}>DEADLINE FOR THIS PROJECT</div>
                <div className={styles.description}>{data.deadline_date}</div>
            </>}
            {children}                
        </div>
    )
}

export default JobDetails
