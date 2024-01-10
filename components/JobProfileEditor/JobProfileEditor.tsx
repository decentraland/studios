import React, { useEffect, useState } from 'react'
import BackButton from '../BackButton/BackButton'

import styles from './JobProfileEditor.module.css'

import { useRouter } from 'next/router'
import { useMessages, useUser } from '../../clients/Sessions'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Job } from '../../interfaces/Job'
import IconFile from '../Icons/IconFile'
import IconX from '../Icons/IconX'
import ErrorScreen from '../ErrorScreen/ErrorScreen'
import Link from 'next/link'
import JobDetails from '../JobDetails/JobDetails'
import { mutate } from 'swr'
import { Conversation } from '../../interfaces/Conversation'
import IconStatus from '../Icons/IconStatus'
import useWindowDimensions, { formatTimeToNow } from '../utils'
import Form from '../Form/Form'
import IconMenu from '../Icons/IconMenu'
import Empty from '../Icons/Empty'
import IconXCircle from '../Icons/IconXCircle'
import { User } from '../../interfaces/User'

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

function JobProfileEditor() {

    const router = useRouter()
    const jobId = router.query.id

    const [jobData, setJobData] = useState<Job>()
    const [conversations, setConversations] = useState<Conversation[]>()
    const [fetchError, setFetchError] = useState('')
    const [showDetailsBox, setShowDetailsBox] = useState(false)
    const [showCloseModal, setShowCloseModal] = useState(false)
    const [showProjectManagerModal, setShowProjectManagerModal] = useState(false)
    const [removeManager, setRemoveManager] = useState<User>()

    const { user } = useUser()

    const { width } = useWindowDimensions()
    const isMobile = width <= 768

    const { data, isLoading, error } = useMessages()

    useEffect(() => {

        if (data?.jobs.length) {
            const job = data.jobs.filter((job: Job) => job.id === jobId)[0]
            const conversations = data.conversations.filter((conversation: Conversation) => conversation.related_job === jobId)

            setConversations(conversations)
            setJobData(job)
        } else {
            if (!isLoading) {
                setFetchError("Wrong link")
            }
        }

    }, [data, isLoading, error])

    const messageCard = (conversation: Conversation) => {
        const message = conversation.messages[0]

        return <Link legacyBehavior key={message.id} href={`/dashboard?conversation=${conversation.id}`}>
            <div className={styles.message}>
                <div className={styles.partner_info}>
                    <span>
                        <div className={styles.partner_logo}
                            style={{
                                background: `url(${DB_URL}/assets/${conversation.studio_data?.logo}?key=logo)`,
                            }}
                        />{conversation.studio_data?.name}
                    </span>
                    <span>
                        {(new Date(message.date_created)).toLocaleDateString()}&nbsp;
                        {(new Date(message.date_created)).toTimeString().slice(0, 5)}
                    </span>
                </div>
                <div className={styles.text_primary}>{message.message}</div>

                {!!message.attachments?.length && <> <br /><br />
                    FILE ATTACHED
                    {message.attachments.map(attachment =>
                        <a key={attachment.directus_files_id.id} target="_blank" rel="noreferrer"
                            href={`${DB_URL}/assets/${attachment.directus_files_id.id}`}>
                            <IconFile red />
                            {` ${attachment.directus_files_id.filename_download}`}
                        </a>)}
                </>}
            </div>
        </Link>
    }

    const CloseProject = () => {
        const [selectedOption, setSelectedOption] = useState('')
        const [text, setText] = useState('')
        const [step, setStep] = useState(jobData?.status === 'archived' ? 1 : 0)

        const disabled = !selectedOption || (selectedOption === "Other" && !text)
        const options = [
            "I hired a Decentraland studio",
            "I hired someone outside this platform",
            "I’m not interested in this project anymore",
            "I’d rather not say",
            "Other"
        ]

        const closeModal = () => {
            setShowCloseModal(false)
        }

        const handleSubmit = async (e: React.FormEvent) => {

            e.preventDefault()
            await fetch(`/api/jobs/close`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    job_id: jobId,
                    closed_poll: `${selectedOption}\n${text}`
                })
            }).then(res => {
                if (res.ok) {
                    mutate('/api/conversations/get')
                    setStep(1)
                }
            })
        }

        return <>
            {!isMobile && showCloseModal && <div className={styles.modalOverlay} onClick={closeModal} />}
            {showCloseModal && <div className={styles.modalContainer}>
                {step === 0 && <><div className={styles.modalTitle}><span>Close project</span><span style={{ cursor: 'pointer' }}><IconX gray onClick={closeModal} /></span></div>
                    <div>When your project closes, you will stop receiving submissions from Decentraland studios.</div>
                    <div>
                        <div className={styles.modalSubtitle}>Why are you closing this project?</div>
                        {options.map(option =>
                            <label className={styles.options} key={option}>
                                <input type="radio" id="budget"
                                    onChange={() => setSelectedOption(option)}
                                    checked={selectedOption === option} />
                                {option}
                            </label>)}
                        <span className={styles.inputText_container}><Form.InputText placeholder="How did your project go?" value={text} onChange={(e) => setText(e.currentTarget.value)} /></span>
                        <form onSubmit={handleSubmit}>
                            <Form.ButtonSubmit value="CLOSE PROJECT" disabled={disabled} />
                        </form>
                    </div></>}
                {step === 1 && <>
                    <div className={styles.modalTitle}><span>Your project is now closed</span><span><IconX gray onClick={closeModal} /></span></div>
                    <div>You closed your project. You will now stop receiving submissions from Decentraland studios.
                        <Link href="/dashboard"><Form.ButtonSubmit inverted value="GO TO DASHBOARD" disabled={false} /></Link>
                    </div>
                </>}
            </div>}
        </>
    }

    const AddProjectManager = () => {
        const [email, setEmail] = useState('')
        const [step, setStep] = useState(0)

        const disabled = !email

        const closeModal = () => {
            setShowProjectManagerModal(false)
            setEmail('')
            setStep(0)
        }

        const handleSubmit = async (e: React.FormEvent) => {

            e.preventDefault()
            await fetch(`/api/jobs/invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    job_id: jobId
                })
            }).then(res => res.ok && setStep(1))
        }

        return <>
            {showProjectManagerModal && step === 0 && <>{!isMobile && <div className={styles.modalOverlay} onClick={closeModal} />}
                <div className={styles.modalContainer}>
                    <div className={styles.modalTitle}><span>Add a project manager</span><span style={{ cursor: 'pointer' }}><IconX gray onClick={closeModal} /></span></div>
                    <div>Enter an email to invite a manager to this project. They will be able to see studios’ submissions, and mark this project as done when necessary.</div>
                    <div>
                        <div className={styles.modalSubtitle}>Project manager email</div>
                        <form onSubmit={handleSubmit}>
                            <Form.InputText type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.currentTarget.value)} />
                            <Form.ButtonSubmit value="ADD PROJECT MANAGER" disabled={disabled} />
                        </form>
                    </div>
                </div></>}

            {showProjectManagerModal && step === 1 && <>{!isMobile && <div className={styles.modalOverlay} onClick={closeModal} />}
                <div className={styles.modalContainer}>
                    <div className={styles.modalTitle}><span>Add a project manager</span><span><IconX gray onClick={closeModal} /></span></div>
                    <div>
                        <div className={styles.modalSubtitle}>Invitation sent! </div>
                        {email} can now see and manage this project.
                    </div>
                </div></>}
        </>
    }

    const RemoveProjectManager = () => {
        const [step, setStep] = useState(0)

        const closeModal = () => {
            setRemoveManager(undefined)
            mutate('/api/conversations/get')
        }

        const handleSubmit = async () => {
            await fetch(`/api/jobs/unmanage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    manager_id: removeManager?.id,
                    job_id: jobId
                })
            }).then(res => {
                if (res.ok) {
                    // mutate('/api/conversations/get')
                    // closeModal()
                    setStep(1)
                }
            })
            // setStep(1)
        }

        return <>
            {removeManager && step === 0 && <>{!isMobile && <div className={styles.modalOverlay} onClick={closeModal} />}
                <div className={styles.modalContainer}>
                    <div className={styles.modalTitle}><span>Remove project manager</span><span style={{ cursor: 'pointer' }}><IconX gray onClick={closeModal} /></span></div>
                    <div>Would you like to remove {removeManager.email} from this project? They will lose access to it and all its submissions.</div>
                    <div className={styles.buttons_row}>
                        <div className='button_primary--inverted' onClick={closeModal}>NO, GO BACK</div>
                        <div className='button_primary--inverted' onClick={handleSubmit}>REMOVE MANAGER</div>
                    </div>
                </div></>}


            {removeManager && step === 1 && <>{!isMobile && <div className={styles.modalOverlay} onClick={closeModal} />}
                <div className={styles.modalContainer}>
                    <div className={styles.modalTitle}><span>Remove project manager</span><span><IconX gray onClick={closeModal} /></span></div>
                    <div>
                        {removeManager?.email} has been removed from this project
                    </div>
                </div></>}
        </>
    }

    const DetailsPanel = ({ jobData }: { jobData: Job }) => {

        const endDate = new Date(jobData.date_created)
        endDate.setDate(endDate.getDate() + 30)

        return <>
            {isMobile && <div className={styles.modalOverlay} onClick={() => setShowDetailsBox(false)} />}
            <div className={styles.detailsBox}>
                <div className={styles.detailsBox_subPanel}>
                    <div className={styles.detailsBox_title}>Details</div>
                    {jobData.status === 'published' ? <>
                        <div className={styles.detailsRow}><span>Status</span><span className={styles.online}><IconStatus /> Open</span></div>
                        <div className={styles.detailsRow}><span>Closes in</span><span>{formatTimeToNow(endDate.toISOString())}</span></div>
                        <div><span onClick={() => setShowCloseModal(true)} className={styles.closeProject_text}>Close project</span></div>
                    </> :
                        <div className={styles.detailsRow}><span>Status</span><span><IconStatus gray /> Closed</span></div>}
                </div>
                <div className={styles.detailsBox_subPanel}>
                    <div className={styles.detailsBox_title}>Managers</div>
                    <div>{jobData.author_name}{user.email === jobData.email ? " (you)" : ""}</div>
                    {jobData.managers.map((co_author: any) => <div key={co_author.id} className={styles.manager_row}><span>{`${co_author.email}${user.email === co_author.email ? " (you)" : ""}`}</span><IconXCircle onClick={() => setRemoveManager({ ...co_author })} /></div>)}

                    {jobData.status === 'published' && <div><span onClick={() => setShowProjectManagerModal(true)} className={styles.projectManager_text}>ADD PROJECT MANAGER +</span></div>}
                </div>
            </div>
        </>
    }

    if (fetchError) {
        console.log(fetchError)
        return <ErrorScreen button={<Link className="button_primary--inverted" href="/dashboard">GO TO DASHBOARD</Link>} />
    }

    if (!user || !jobData?.id) {
        return <Loader active>Loading...</Loader>
    }

    return (
        <div className={styles.container}>
            <CloseProject />
            <AddProjectManager />
            <RemoveProjectManager />
            <div className={styles.backButton}>
                <BackButton small onClick={() => router.push("/dashboard")} />
                <div className={styles.detailsLinkMobile}
                    onClick={() => setShowDetailsBox(true)}>
                    PROJECT DETAILS <IconMenu small red />
                </div>
            </div>
            <JobDetails jobData={jobData}>
                <>
                    <div className={styles.subTitle}>Submissions <span className={styles.column_counter}>{conversations?.length}</span></div>
                    {conversations?.length ? conversations.map(conversation => messageCard(conversation))
                        :
                        <div className={styles.empty}>
                            <Empty gray />
                            <span>You will receive email notifications when studios apply to work with you. If you know any Decentraland Studio, <a target="_blank" rel="noreferrer" href={`/jobs/share?id=${jobData.id}`}>share this project</a> with them.</span>
                        </div>}
                </>
            </JobDetails>
            {(!isMobile || showDetailsBox) && <DetailsPanel jobData={jobData} />}
        </div >
    )
}

export default JobProfileEditor
