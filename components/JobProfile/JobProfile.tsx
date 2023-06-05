import React, { ChangeEvent, useEffect, useState } from 'react'
import BackButton from '../BackButton/BackButton'

import styles from './JobProfile.module.css'

import MarkdownDescription from '../MarkdownDescription/MarkdownDescription'
import { useRouter } from 'next/router'
import { getLoggedState } from '../sessions'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Job, JobMessage } from '../../interfaces/Job'
import IconInfo from '../Icons/IconInfo'
import IconOk from '../Icons/IconOk'
import IconFile from '../Icons/IconFile'
import IconX from '../Icons/IconX'
import ErrorScreen from '../ErrorScreen/ErrorScreen'
import Link from 'next/link'
import { budgetToRanges } from '../utils'

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

function JobProfile() {

    const router = useRouter()
    const jobId = router.query.id

    const [jobData, setJobData] = useState<Job>()
    const [sentMessage, setSentMessage] = useState<JobMessage>()
    const [showSentBadge, setShowSentBadge] = useState(false)
    const [isLogged, setLogged] = useState(false)
    const [loading, setLoading] = useState(false)
    const [newMessage, setNewMessage] = useState<string>()
    const [selectedFile, setSelectedFile] = useState<File>()
    const [fileError, setFileError] = useState(false)
    const [fetchError, setFetchError] = useState<string>('')

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
                body: JSON.stringify({ id: jobId })
            })
                .then(res => res.ok && res.json())
                .then((res) => {
                    if (!res.job) setFetchError('Error: Missing data')
                    res.job && setJobData(res.job)
                    res.message && setSentMessage(res.message)
                })
                .catch((err) => console.log(err))
            setLoading(false)
        }
    }

    const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
        setFileError(false)

        if (e.target.files?.length){
            if (e.target.files[0].size > 10000000){
                setFileError(true)
            } else {
                setSelectedFile(e.target.files[0])
                setFileError(false)
            }
        } else {
            setSelectedFile(undefined)
        }
    }

    const handleFileRemove = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        setSelectedFile(undefined)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        let postMessage = {
            message: newMessage,
            brief_file: null
        }

        if (fileError){
            setLoading(false)
           return alert('Please check slected file size.')
        }

        if (selectedFile){
            await fetch(`/api/upload`, {
                method: 'POST',
                headers: {
                    fileName: selectedFile.name,
                    folder: '193e00bb-923e-46f0-b350-bf73ba107a80'
                },
                body: selectedFile,
            })
            .then(res => {
                if (res.ok){
                    return res.json()
                } else {
                    setFetchError('file upload error')
                }
            })
            .then(({ data }) => {postMessage.brief_file = data})
        }

        await fetch('/api/jobs/apply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ job: jobData, message: postMessage })
        })
            .then(res => { 
                if (res.ok) {
                    fetchData()
                    setShowSentBadge(true)
                } else {
                    setFetchError('message submit error')
                }
        })
    }

    const emptyFields = !newMessage

    const MessageSentBadge = () => {
        if (showSentBadge) {
            setTimeout(() => setShowSentBadge(false), 3000)
            return <div className={styles.sentMessage__badge}><IconOk />Message Sent</div>
        }
        return null
    }

    if(fetchError){
        console.log(fetchError)
        return <ErrorScreen button={<Link className="button_primary--inverted" href="/jobs">GO TO JOBS</Link>}
                 onBackClick={() => { 
                    setFetchError('')
                    setLoading(false)
                }} />
    }

    if (loading || !isLogged || !jobData?.id) {
        return <Loader active>Loading...</Loader>
    }

    return (
        <div className={styles.container}>
            <div className={styles.backButton}><BackButton onClick={() => router.push('/jobs/list')} /></div>
            <div className={styles.dataContainer}>
                <div className={styles.postedBy}>Project created by <b>{jobData.author_name}</b>{jobData.company && <> from <b>{jobData.company}</b></>}</div>
                <div className={styles.title}>{jobData.title}</div>
                <div className={styles.infoTitle}>SHORT DESCRIPTION</div>
                <div className={styles.description}>{jobData.short_description}</div>
                <div className={styles.infoTitle}>FULL DESCRIPTION</div>
                <MarkdownDescription className={styles.description} description={jobData.long_description} />
                {jobData.brief_file && <>
                    <div className={styles.infoTitle}>BRIEF FILE</div>
                    <a className={styles.link} href={`${DB_URL}/assets/${jobData.brief_file.id}`} rel="noreferrer" target='_blank'><IconFile red /> {jobData.brief_file.filename_download}</a>
                </>}
                <div className={styles.infoTitle}>BUDGET</div>
                <div className={styles.description}>{budgetToRanges(jobData.budget)}</div>

                {sentMessage ? <>
                    <div className={styles.subTitle}>You’ve sent a message to {jobData.author_name}</div>
                    <div className={styles.message}>
                        <div className={styles.partner_info}>
                            <span>
                                <div className={styles.partner_logo}
                                    style={{
                                        background: `url(${DB_URL}/assets/${sentMessage.from_profile.logo}?key=logo)`,
                                    }}
                                />{sentMessage.from_profile.name}
                            </span>
                            <span>
                                {(new Date(sentMessage.date_created)).toLocaleDateString()}&nbsp;
                                {(new Date(sentMessage.date_created)).toTimeString().slice(0, 5)}
                            </span>
                        </div>
                        <div className={styles.text_primary}>{sentMessage.message}</div>
                    
                        {sentMessage.brief_file && <>
                            <div className={styles.infoTitle}>BRIEF FILE</div>
                            <a className={styles.link} href={`${DB_URL}/assets/${sentMessage.brief_file.id}`} rel="noreferrer" target='_blank'><IconFile red /> {sentMessage.brief_file.filename_download}</a>
                        </>}
                    </div>
                    <div className={styles.text_postMessage}>If {jobData.author_name} replies, you will receive an <b>email notification</b></div>
                    <MessageSentBadge />
                </>
                    :
                    <>
                        <div className={styles.subTitle}>Interested in this project? Write a private message to {jobData.author_name}</div>
                        <div className={styles.text_primary}>You can only send one message to {jobData.author_name}. Use this message to leave a memorable and impactful impression.</div>
                        <form onSubmit={handleSubmit}>
                            <textarea className={styles.inputText} rows={6}
                                placeholder='Your message goes here'
                                value={newMessage}
                                onChange={val => setNewMessage(val.target.value)} />
                            <div className={styles.text_secondary}><IconInfo gray /> This will be sent to {jobData.author_name} via email, along with your portfolio in Decentraland Studios.</div>
                            
                            <div className={styles.label_file}>Upload a file (Optional)</div>
                            <div className={styles.text_primary}>
                                If you already have a presentation of your team or a proposal for this project, upload it here.
                            </div>
                            <label className={styles.input_file}>
                                <input type='file' name="brief_file" accept=".pdf" onChange={handleFileInput} onClick={(event: React.MouseEvent<HTMLInputElement>)  => event.currentTarget.value = ''}/>
                                <span className='button_primary--inverted'>SELECT FILE</span>
                                <span className='ml-1'>{selectedFile ? <span>{selectedFile.name} <IconX gray className='ml-1' style={{height: '11px', width: '11px'}} onClick={handleFileRemove}/></span> : 'No file selected.'}</span>
                            </label>
                            <div className={styles.text_secondary} style={fileError ? {color: '#FF2D55'} : {}}><IconInfo gray={!fileError} /> PDF files only, maximum size is 10 MB.</div>

                            
                            <input type="submit" value="SEND MESSAGE"
                                className={`${styles.submitBtn} ${emptyFields ? styles.submitBtn_disabled : ''}`}
                                disabled={emptyFields} />
                        </form>
                    </>}
            </div>
        </div>
    )
}

export default JobProfile
