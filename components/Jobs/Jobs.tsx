import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Filter, FilterGroup } from '../../interfaces/Filters'
import { Job } from '../../interfaces/Job'
import BannerJobs from '../BannerJobs/BannerJobs'
import Empty from '../Icons/Empty'
import IconMenu from '../Icons/IconMenu'
import JobProfile from '../JobProfile/JobProfile'
import LayoutFilteredList from '../LayoutFilteredList/LayoutFilteredList'
import { logout, getLoggedState } from '../sessions'
import { budgetToRanges, timeSince } from '../utils'

import styles from './Jobs.module.css'

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
    }
]

export default function Jobs() {

    const router = useRouter()


    const [jobs, setJobs] = useState([])
    const [isLogged, setLogged] = useState(false)
    const [filters, setFilters] = useState([] as Filter[])
    const [limit, setLimit] = useState(5)

    useEffect(() => {
        getLoggedState().then(res => {
            if (res) {
                setLogged(res)
            } else {
                router.push(`/login?from=${router.asPath}`, '/login')
            }
        })
    }, [])

    useEffect(() => {
        handleFetchJobs()
    }, [isLogged])

    const handleLogout = () => {

        logout().then(() => router.push("/login"))
        .catch((e) => alert(e));
    }

    const handleFetchJobs = () => {
        if (isLogged) {
            fetch('/api/jobs/list')
                .then(res => res.ok && res.json())
                .then((res) => res.data && setJobs(res.data))
                .catch((err) => console.log(err))
        }
    }

    const jobCard = (data: Job) => {
        return <Link href={`/jobs/list?id=${data.id}`} key={data.id} legacyBehavior>
            <div className={styles.jobContainer} >
                <div className={styles.titleContainer}>
                    <span className={styles.jobTitle}>{data.title}</span>
                    <span className={styles['jobBudget--mobile']}>Budget: {budgetToRanges(data.budget)}</span>
                </div>
                <div className={styles.description}>{data.long_description}</div>
                <div className={styles.jobBy}>
                    <span>Posted by <b>{data.author_name}</b> {timeSince(data.date_created)} ago</span>
                    <span className={styles['jobBudget--desktop']}><b>Budget: </b>{budgetToRanges(data.budget)}</span>
                </div>
            </div>
        </Link>
    }

    const EmptyPanel = () => <div className={styles.empty}>
        <Empty />
        <br />
        {filters.length ? "Sorry, we couldn't find any jobs that match your search criteria." : "There are no jobs available right now"}
    </div>


    const UserMenu = () => {
        const [open, setOpen] = useState(false)
        
        return <div tabIndex={0} className={styles.menuContainer}
            onFocus={() => setOpen(true)} 
            onBlur={() => setOpen(false)}
            >
            <IconMenu />
            {open && <div className={`button_primary--inverted ${styles.menuItem}`}
                onClick={handleLogout}>
                    Log out
                </div>}
            </ div>
    }

    const filterElements = (items: Job[], filter: Filter) => {
        if (filter.key === 'budget') {
            return items.filter((item: Job) => filter.value[0] <= item.budget && filter.value[1] > item.budget)
        }
        return items.filter((item: any) => item[filter.key] === filter.value)
    }

    let filteredJobs: Job[] = []

    if (filters.length) {
        filters.forEach(filter => filteredJobs = filteredJobs.concat(filterElements(jobs, filter)))
    } else {
        filteredJobs = jobs
    }

    if (!isLogged) {
        return <><Loader active>Loading...</Loader></>
    }

    if (router.query.id){
        return <JobProfile />
    }

    const HeaderBar = () => <span className={styles.headerText}>Jobs for Decentraland Studios <span className={styles.resultsCount}>{filteredJobs.length} RESULT{filteredJobs.length > 1 ? 'S' : ''}</span></ span>

    const JobsList = () =>{
        if (filteredJobs.length){
            const dateToMilis = (stringDate: string) => (new Date(stringDate)).getTime()
            const sortedByDateJobs = filteredJobs.sort((j1, j2) => dateToMilis(j2.date_created) - dateToMilis(j1.date_created))
            return <>
                {sortedByDateJobs.slice(0, limit).map(job => jobCard(job))}
                {sortedByDateJobs.length > limit ? <div style={{textAlign: 'center'}}>
                        <div className='button_primary--inverted mb-4' onClick={() => setLimit(limit + 10)}>
                            SHOW MORE
                        </div>
                    </div> : null}
            </>
        }
        return <EmptyPanel />
    }

    return <>
        <BannerJobs />
        <LayoutFilteredList activeFilters={filters} setActiveFilters={setFilters}
            filtersList={avilableFilters}
            listPanel={<JobsList />}
            headerBar={<HeaderBar />}
            headerButton={<UserMenu />} />
    </>
}