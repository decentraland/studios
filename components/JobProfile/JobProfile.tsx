import React, { useEffect, useState } from 'react'
import BackButton from '../BackButton/BackButton'

import styles from './JobProfile.module.css'

import { useRouter } from 'next/router'
import { useUser } from '../../clients/Sessions'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Job } from '../../interfaces/Job'
import IconInfo from '../Icons/IconInfo'
import IconOk from '../Icons/IconOk'
import IconFile from '../Icons/IconFile'
import IconX from '../Icons/IconX'
import ErrorScreen from '../ErrorScreen/ErrorScreen'
import Link from 'next/link'
import JobDetails from '../JobDetails/JobDetails'
import IconStatus from '../Icons/IconStatus'
import { formatTimeToNow } from '../utils'

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

function JobProfile() {

    const router = useRouter()
    const jobId = router.query.id

    const [jobData, setJobData] = useState<Job>()
    const [showSentBadge, setShowSentBadge] = useState(false)
    const [isLogged, setLogged] = useState(false)
    const [loading, setLoading] = useState(false)
    const [newMessage, setNewMessage] = useState('')
    const [selectedFile, setSelectedFile] = useState<File>()
    const [fileValidationFail, setFileValidationFail] = useState(false)
    const [fetchError, setFetchError] = useState<string>('')

    // useEffect(() => {
    //     getLoggedState().then(res => {
    //         if (res) {
    //             setLogged(res)
    //         } else {
    //             router.push('/login')
    //         }
    //     })
    // }, [])

    const { user } = useUser()

    // useEffect(() => {
    //     if (isLoading) return

    //     if (!user){
    //         router.push('/login')
    //     } else if (user.role.name !== 'Studio'){
    //         router.push('/')
    //     }
    // }, [user, isLoading])

    useEffect(() => {
        fetchData()
    }, [user])

    const fetchData = async () => {
        if (user && jobId) {
            setLoading(true)
            await fetch(`/api/jobs/get?id=${jobId}`)
                .then(res => res.ok && res.json())
                .then((jobData) => {
                    if (!jobData) setFetchError('Error: Missing data')
                    setJobData(jobData)
                })
                .catch((err) => console.log(err))
            setLoading(false)
        }
    }
    const handleFileInput = (e: React.FormEvent<HTMLInputElement>) => {

        if (e.currentTarget.files?.length) {
            if (e.currentTarget.files[0].size > 10000000) {
                setFileValidationFail(true)
            } else {
                setSelectedFile(e.currentTarget.files[0])
                setFileValidationFail(false)
            }
        } else {
            setSelectedFile(undefined)
            setFileValidationFail(false)
        }
    }

    const handleFileRemove = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        setSelectedFile(undefined)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        if (fileValidationFail) {
            setLoading(false)
            return alert('Please check slected file size.')
        }
        
        if(!jobData || !newMessage){
            return
        }

        const formData = new FormData();
        formData.append('text', newMessage)

        if (selectedFile) {
            formData.append(`attachment1`, selectedFile)
            const attachment_info = {attachment1: { filename: selectedFile.name, type: selectedFile.type }}
            formData.append('attachment-info', JSON.stringify(attachment_info))
        }

        const submitMessage = await fetch(`/api/jobs/apply?id=${jobData.id}`, {
            method: 'POST',
            body: formData
        }).then(res => res.ok)

        if (submitMessage) {
            fetchData()
            setShowSentBadge(true)
        } else {
            console.log(submitMessage)
            setFetchError('Message submit error')
        }
    }

    const emptyFields = !newMessage

    const MessageSentBadge = () => {
        if (showSentBadge) {
            setTimeout(() => setShowSentBadge(false), 3000)
            return <div className={styles.sentMessage__badge}><IconOk />Message Sent</div>
        }
        return null
    }

    const DetailsPanel = ({ jobData }: { jobData: Job }) => {

        const endDate = new Date(jobData.date_created)
        endDate.setDate(endDate.getDate() + 30)

        return <div className={styles.detailsBox}>
                <div className={styles.detailsBox_subPanel}>
                    <div className={styles.detailsBox_title}>Details</div>
                    {jobData.status === 'published' ? <>
                        <div><span className={styles.col_1}>Status</span><span className={styles.online}><IconStatus /> Open</span></div>
                        <div><span className={styles.col_1}>Closes in</span><span>{formatTimeToNow(endDate.toISOString())}</span></div>
                    </> :
                        <div>Status <span><IconStatus gray /> Closed</span></div>}
                </div>
            </div>
    }

    if (fetchError) {
        console.log(fetchError)
        return <ErrorScreen button={<Link className="button_primary--inverted" href="/jobs">GO TO JOBS</Link>}
            onBackClick={() => {
                setFetchError('')
                setLoading(false)
            }} />
    }

    if (loading || !user || !jobData?.id) {
        return <Loader active>Loading...</Loader>
    }

    return (
        <div className={styles.container}>
            <div className={styles.backButton}><BackButton small onClick={() => router.back()} /></div>
            <JobDetails jobData={jobData}>

                {jobData.messages.length ? <>
                    <div className={styles.subTitle}>You’ve sent a private message to {jobData.author_name}</div>
                    <div className={styles.message}>
                        <div className={styles.partner_info}>
                            <span>
                                <div className={styles.partner_logo}
                                    style={{
                                        background: `url(${DB_URL}/assets/${jobData.messages[0].from_profile.logo}?key=logo)`,
                                    }}
                                />{jobData.messages[0].from_profile.name}
                            </span>
                            <span>
                                {(new Date(jobData.messages[0].date_created)).toLocaleDateString()}&nbsp;
                                {(new Date(jobData.messages[0].date_created)).toTimeString().slice(0, 5)}
                            </span>
                        </div>
                        <div className={styles.text_primary}>{jobData.messages[0].message}</div>

                        {jobData.messages[0].brief_file && <>
                            <div className={styles.infoTitle}>BRIEF FILE</div>
                            <a className={styles.link} href={`${DB_URL}/assets/${jobData.messages[0].brief_file.id}`} rel="noreferrer" target='_blank'><IconFile red /> {jobData.messages[0].brief_file.filename_download}</a>
                        </>}
                    </div>
                    <div className={styles.text_postMessage}>If {jobData.author_name} replies, you will receive an <b>email notification</b></div>
                    <MessageSentBadge />
                </>
                    :
                    <>
                        <div className={styles.subTitle}>Interested in this project? Send a private message to {jobData.author_name}</div>
                        <div className={styles.text_primary}>You can only send one message to {jobData.author_name}. Use this message to leave a memorable and impactful impression.</div>
                        <form onSubmit={handleSubmit}>
                            <textarea className={styles.inputText} rows={6}
                                placeholder='Your message goes here'
                                value={newMessage}
                                onChange={val => setNewMessage(val.target.value)} />
                            <div className={styles.text_secondary}><IconInfo /> This will be sent to {jobData.author_name} via email, along with your portfolio in Decentraland Studios.</div>

                            {/*<div className={styles.label_file}>Upload a file (Optional)</div>
                            <div className={styles.text_primary}>
                                If you already have a presentation of your team or a proposal for this project, upload it here.
                            </div>
                            <label className={styles.input_file}>
                                <input type='file' accept=".pdf" onChange={handleFileInput} onClick={(event: React.MouseEvent<HTMLInputElement>) => event.currentTarget.value = ''} />
                                <span className='button_primary--inverted'>SELECT FILE</span>
                                <span className='ml-1'>{selectedFile ? <span>{selectedFile.name} <IconX gray className='ml-1' style={{ height: '11px', width: '11px' }} onClick={handleFileRemove} /></span> : 'No file selected.'}</span>
                            </label>
                        <div className={styles.text_secondary} style={fileValidationFail ? { color: '#FF2D55' } : {}}><IconInfo red={fileValidationFail} /> PDF files only, maximum size is 10 MB.</div>*/}


                            <input type="submit" value="SEND MESSAGE"
                                className={`${styles.submitBtn} ${emptyFields ? styles.submitBtn_disabled : ''}`}
                                disabled={emptyFields} />
                        </form>
                    </>}
            </JobDetails>
            <DetailsPanel jobData={jobData} />
        </div>
    )
}

export default JobProfile
