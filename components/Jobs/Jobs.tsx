import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Filter, FilterGroup } from '../../interfaces/Filters'
import { Job } from '../../interfaces/Job'
import BannerJobs from '../BannerJobs/BannerJobs'
import Empty from '../Icons/Empty'
import JobProfile from '../JobProfile/JobProfile'
import LayoutFilteredList from '../LayoutFilteredList/LayoutFilteredList'
import { useUser } from '../../clients/Sessions'
import { budgetToRanges, formatTimeToNow } from '../utils'

import styles from './Jobs.module.css'
import AppliedTag from '../AppliedTag/AppliedTag'
import IconExternal from '../Icons/IconExternal'

const JOIN_REGISTRY_URL = process.env.NEXT_PUBLIC_JOIN_REGISTRY_URL

const avilableFilters: FilterGroup[] = [
    {
        title: 'BUDGET',
        options: [
            {
                key: 'budget',
                value: [0, 1000],
                displayValue: 'Up to $1000'
            },
            {
                key: 'budget',
                value: [1000, 5000],
                displayValue: '$1000 to $5000'
            },
            {
                key: 'budget',
                value: [5000, 20000],
                displayValue: '$5000 to $20000'
            },
            {
                key: 'budget',
                value: [20000, 50000],
                displayValue: '$20000 to $50000'
            },
            {
                key: 'budget',
                value: [50000, Infinity],
                displayValue: 'More than $50000'
            }
        ]
    },
    {
        title: 'APPLICATION STATUS',
        options: [
            {
                key: 'messages',
                value: true,
                displayValue: 'Applied'
            },
            {
                key: 'messages',
                value: false,
                displayValue: 'Not applied'
            }
        ]
    }
]

export default function Jobs() {

    const router = useRouter()
    const { user, userLoading } = useUser()

    useEffect(() => {
        if (userLoading) return

        if (!user) {
            router.push('/login')
            // } else if (user.role.name !== 'Studio'){
            //     router.push('/')
        }
    }, [user, userLoading])

    const [jobs, setJobs] = useState([])
    const [filters, setFilters] = useState([] as Filter[])
    const [limit, setLimit] = useState(5)

    useEffect(() => {
        handleFetchJobs()
    }, [user])

    const handleFetchJobs = () => {
        if (user && user.role.name !== "Client") {
            fetch('/api/jobs/get')
                .then(res => res.ok && res.json())
                .then((res) => res.data && setJobs(res.data))
                .catch((err) => console.log(err))
        }
    }

    const jobCard = (data: Job) => {
        return <Link href={`/jobs?id=${data.id}`} key={data.id} legacyBehavior>
            <div className={styles.jobContainer} >
                <div className={styles.titleContainer}>
                    <span className={styles.jobTitle}>{data.title}</span>
                    {data.messages.length ? <AppliedTag /> : null}
                </div>
                <div className={styles.description}>{data.long_description}</div>
                <div className={styles.cardFooter}>
                    <span className={styles.jobBy}>Posted by <span>{data.author_name}</span> {formatTimeToNow(data.date_created)} ago</span>
                    <span className={styles.jobBudget}><b>Budget: </b>{budgetToRanges(data.budget)}</span>
                </div>
            </div>
        </Link>
    }

    const EmptyPanel = () => <div className={styles.empty}>
        <Empty />
        <br />
        {filters.length ? "Sorry, we couldn't find any jobs that match your search criteria." : "There are no jobs available right now"}
    </div>


    const filterElement = (item: any, filter: Filter) => {
        if (filter.key === 'budget') {
            return filter.value[0] <= item.budget && filter.value[1] > item.budget
        }
        if (filter.key === 'messages') {
            return !!item['messages'].length === filter.value
        }
        return item[filter.key] === filter.value
    }

    let filteredJobs: Job[] = []

    if (filters.length) {
        filteredJobs = jobs.filter(job => filters.every(filter => filterElement(job, filter)))
    } else {
        filteredJobs = jobs
    }

    if (!user) {
        return <><Loader active>Loading...</Loader></>
    }

    if (router.query.id) {
        return <JobProfile />
    }

    const HeaderBar = () => <span className={styles.headerText}>{filteredJobs.length ? filteredJobs.length : ''} project{filteredJobs.length !== 1 ? 's' : ''}</ span>

    const JobsList = () => {
        if (filteredJobs.length) {
            const dateToMilis = (stringDate: string) => (new Date(stringDate)).getTime()
            const sortedByDateJobs = filteredJobs.sort((j1, j2) => dateToMilis(j2.date_created) - dateToMilis(j1.date_created))
            return <>
                {sortedByDateJobs.slice(0, limit).map(job => jobCard(job))}
                {sortedByDateJobs.length > limit ? <div style={{ textAlign: 'center' }}>
                    <div className='button_primary--inverted mb-4' onClick={() => setLimit(limit + 10)}>
                        SHOW MORE
                    </div>
                </div> : null}
            </>
        }
        return <EmptyPanel />
    }
    const BrandsMessage = () => {
        return <div className={styles.brandsState}>
            <img src='/images/empty_jobs_desktop.webp' />
            <div className={styles['brandsState--modal']}>
                <div className={styles['brandsState--title']}>Welcome to our job board!</div>
                <div className={styles['brandsState--text']}>To access job opportunities in Decentraland, we require users to <b>register as a Studio.</b> This verification process helps us ensure the quality and legitimacy of our community while providing the best experience for both employers and job seekers.</div>
                <a className={styles['brandsState--button']}
                    href={JOIN_REGISTRY_URL} rel="noreferrer" target="_blank">
                    REGISTER AS A STUDIO <IconExternal />
                </a>
            </div>
        </div>
    }

    if (user.role.name === "Client") {
        return <BrandsMessage />
    }

    return <>
        <BannerJobs />
        <LayoutFilteredList activeFilters={filters} setActiveFilters={setFilters}
            filtersList={avilableFilters}
            listPanel={<JobsList />}
            headerBar={<HeaderBar />} />
    </>
}