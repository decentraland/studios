import React, { useEffect, useState } from 'react'
import BackButton from '../BackButton/BackButton'

import styles from './JobDetails.module.css'

import MarkdownDescription from '../MarkdownDescription/MarkdownDescription'
import { useRouter } from 'next/router'
import { getLoggedState } from '../sessions'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Job, JobMessage } from '../../interfaces/Job'
import IconInfo from '../Icons/IconInfo'
import IconOk from '../Icons/IconOk'

const DATA_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

interface DataProps {
    job: Job
    message: JobMessage
}

function JobDetails() {

    const router = useRouter()
    const jobId = router.query.id

    const [data, setData] = useState({} as DataProps)
    const [message, setMessage] = useState('' as string)
    const [isLogged, setLogged] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showSentBadge, setShowSentBadge] = useState(true)

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
        fetchData()
    }, [isLogged, jobId])

    const fetchData = async () => {
        if (isLogged && jobId) {
            setLoading(true)
            await fetch('/api/jobs/get', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: jobId }) })
                .then(res => res.ok && res.json())
                .then((res) => {
                    res.job && setData( {job: res.job, message: res.message})
                    // res.message && setMessage(res.message)
                })
                .catch((err) => console.log(err))
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        setLoading(true)
        await fetch('/api/jobs/apply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ job, message })
        })
            .then(res => {res.ok && fetchData()})
            .catch((err) => {
                console.log(err)
                setLoading(false)
            })
    }

    const emptyFields = !message
    const job = data.job
    const sentMessage = data.message

    if (loading || !isLogged || !job?.id) {
        return <Loader active>Loading...</Loader>
    }

    const MessageSentBadge = () => {
       if (showSentBadge) {
            setTimeout(() => setShowSentBadge(false), 3000)
           return <div className={styles.sentMessage__badge}><IconOk />Message Sent</div>
       }
    return null
    }

    return (
        <div className={styles.container}>
            <div className={styles.backButton}><BackButton onClick={() => router.push('/jobs')} /></div>
            <div className={styles.dataContainer}>
                <div className={styles.postedBy}>Job created by <b>{job.author_name}</b>{job.company && <> from <b>{job.company}</b></>}</div>
                <div className={styles.title}>{job.title}</div>
                <div className={styles.infoTitle}>SHORT DESCRIPTION</div>
                <div className={styles.description}>{job.short_description}</div>
                <div className={styles.infoTitle}>FULL DESCRIPTION</div>
                <MarkdownDescription className={styles.description} description={job.long_description} />
                <div className={styles.infoTitle}>BUDGET</div>
                <div className={styles.description}>${job.budget_min} to ${job.budget_max}</div>

                {sentMessage ? <>
                        <div className={styles.subTitle}>You’ve sent a message to {job.author_name}</div>
                        <div className={styles.message}>
                            <div className={styles.partner_info}>
                                <span>
                                    <div className={styles.partner_logo}
                                        style={{
                                            background: `url(${DATA_URL}/assets/${sentMessage.from_profile.logo}?key=logo)`,
                                        }}
                                    />{sentMessage.from_profile.name}
                                </span>
                                <span>
                                    {(new Date(sentMessage.date_created)).toLocaleDateString()}&nbsp;
                                    {(new Date(sentMessage.date_created)).toTimeString().slice(0, 5)}
                                </span>
                            </div>
                            <div className={styles.text_primary}>{sentMessage.message}</div>
                        </div>
                        <div className={styles.text_postMessage}>If {job.author_name} replies, you will receive an <b>email notification</b></div>
                        <MessageSentBadge />
                    </>
                    :
                    <>
                        <div className={styles.subTitle}>Interested in this project? Write a private message to {job.author_name}</div>
                        <div className={styles.text_primary}>Use this message to explain why you are a good fit for this project. Focus on the studio proposal for the brand.</div>
                        <form onSubmit={handleSubmit}>
                            <textarea className={styles.inputText} rows={6}
                            placeholder='Your message goes here'
                            onChange={val => setMessage(val.target.value)}/>
                            <div className={styles.text_secondary}><IconInfo gray /> This will be sent to {job.author_name} via email, along with your portfolio in Decentraland Studios.</div>
                            <input type="submit" value="SEND MESSAGE"
                                className={`${styles.submitBtn} ${emptyFields ? styles.submitBtn_disabled : ''}`}
                                disabled={emptyFields}/>
                        </form>
                    </>}
            </div>
        </div>
    )
}

export default JobDetails
