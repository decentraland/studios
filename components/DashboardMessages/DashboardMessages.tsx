import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { mutate } from 'swr'
import { Job } from '../../interfaces/Job'
import { Message, UIConversation } from '../../interfaces/Conversation'
import { useMessages, useUser } from '../../clients/Sessions'
import useWindowDimensions, { formatTimeToNow } from '../utils'

import styles from './DashboardMessages.module.css'
import UserAvatar from '../UserAvatar/UserAvatar'
import { VerifiedPartner } from '../../interfaces/VerifiedPartner'
import IconSend from '../Icons/IconSend'
import IconFile from '../Icons/IconFile'
import IconStatus from '../Icons/IconStatus'
import IconOpenProject from '../Icons/IconOpenProject'
import IconFilter from '../Icons/IconFilter'
import BackButton from '../BackButton/BackButton'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { useRouter } from 'next/router'
import JobProfileEditor from '../JobProfileEditor/JobProfileEditor'

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
const CREATE_PROJECT_URL = '/jobs/hire'

export default function MessagesDashboard() {

    const [currentJob, setCurrentJob] = useState<Job>()
    const [highlightedJob, setHighlightedJob] = useState<Job>()
    const [currentConversationId, setCurrentConversationId] = useState<string>()
    const [currentColumn, setCurrentColumn] = useState('jobs')

    const router = useRouter()

    useEffect(() => {
        if (router.query.conversation) {
            setCurrentConversationId(`${router.query.conversation}`)
            router.replace('/dashboard', undefined, {shallow: true});
        }
    }, [router.query.conversation])

    const { width } = useWindowDimensions()
    const isMobile = width <= 933

    const { user, userLoading } = useUser()

    const { data, isLoading, error } = useMessages()

    const jobs: Job[] = data ? data.jobs : []
    const conversations: UIConversation[] = data ? data.conversations : []
    
    const getConversationData = (id?: string) => {
        return conversations.length ? conversations?.find((conversation: UIConversation) => conversation.id === id) : {} as UIConversation
    }

    useEffect(() => {
        if (currentConversationId && currentJob && getConversationData(currentConversationId)?.related_job !== currentJob?.id) {
            setCurrentConversationId(undefined)
        }
    }, [currentJob])

    if (!userLoading && !user) {
        router.push('/login')
    }
    
    if (isLoading || error) {
        return <Loader active>Loading...</Loader>
    }

    if (router.query.id) {
        return <JobProfileEditor />
    }

    const filteredConversations = currentJob && conversations ?
        conversations.filter(conversation => conversation.related_job === currentJob.id)
        :
        conversations

    const dateToMilis = (stringDate: string) => (new Date(stringDate)).getTime()

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return `${date.getDate()}/${date.getMonth() + 1}`
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return `${date.getHours()}:${date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()}`
    }

   

    const EmptyColumn = ({ text }: { text?: string }) =>
        <div className={styles.empty}>
            <img src='/images/empty_column.webp' alt='' />
            {text && <div className={styles.empty_text}>{text}</div>}
        </div>

    const ColumnHeaderMobile = () => {
        return <div className={`${styles.column_header} ${styles['column_header--mobile']}`}>
            <div className={`${styles['column_title']} ${currentColumn === 'jobs' ? styles['column_title--selected'] : ''}`}
                onClick={() => {
                    setCurrentColumn('jobs')
                    currentJob && setCurrentJob(undefined)
                }}>
                PROJECTS
                <span className={`${styles.column_counter} ${currentColumn === 'jobs' ? styles['column_counter--red'] : ''}`}>{jobs.length}</span>
            </div>
            <div className={`${styles['column_title']} ${currentColumn === 'conversations' ? styles['column_title--selected'] : ''}`}
                onClick={() => { setCurrentColumn('conversations') }}>
                SUBMISSIONS
                <span className={`${styles.column_counter} ${currentColumn === 'conversations' ? styles['column_counter--red'] : ''}`}
                    onClick={() => currentJob && setCurrentJob(undefined)}>
                    {filteredConversations.length}{currentJob && <IconFilter full />}
                </span>
            </div>
            <div className={styles['create_btn']}><Link href={CREATE_PROJECT_URL}>+</Link></div>

        </div>
    }

    const jobCard = (job: Job) => {
        const isSelected = highlightedJob?.id === job.id
        const isCurrentJob = currentJob?.id === job.id
        const conversationsCount = conversations.length ? conversations.filter(conversation => conversation.related_job === job.id).length : 0

        const endDate = new Date(job.date_created)
        endDate.setDate(endDate.getDate() + 30)

        return <div key={job.id} className={`${styles.job_card}  ${isSelected ? styles.active : ''}`}
            onClick={() => {
                setCurrentJob(isCurrentJob ? undefined : job)
                setHighlightedJob(isCurrentJob ? undefined : job)
                setCurrentColumn('conversations')
            }}>
            <div className={`${styles.card_row} ${styles['card_row--title']}`}>
                <span>{job.title}</span><span>{conversationsCount}</span>
            </div>
            <div className={styles.card_row}>
                {/* <span> */}
                {job.status === 'published' ? <>
                    <IconStatus /><span className={styles.online}> Open</span>
                    <span className={styles.grayText}>Closes in {formatTimeToNow(endDate.toISOString())}</span>
                </> :
                    <><IconStatus gray /><span className={styles.grayText}>Closed</span></>
                }
                {/* </span> */}
                <span className={styles.show_active}><Link href={`/dashboard?id=${job.id}`}><IconOpenProject /></Link></span>
            </div>
        </div>
    }

    const JobsColumn = () => {
        const sortedByDateJobs = jobs.sort((j1, j2) => dateToMilis(j2.date_created) - dateToMilis(j1.date_created))
        return <div className={styles.column}>
            {!isMobile && <div className={styles.column_header}>YOUR PROJECTS <span className={styles.column_counter}>{jobs.length}</span></div>}
            {isMobile && <ColumnHeaderMobile />}
            <div className={`${styles['column_contents']} ${styles['column_contents--jobs']} ${!jobs.length ? styles['column_contents--empty'] : ''}`}>
                {!jobs.length ? <EmptyColumn />
                    :
                    sortedByDateJobs.map(job => jobCard(job))
                }
            </div>
        </div>
    }

    const conversationCard = (conversation: UIConversation) => {
        const isSelected = currentConversationId === conversation.id
        const lastMessage = conversation.messages.at(-1) || {} as Message

        const hasNewMessages = conversation.last_read_message < lastMessage.id || !conversation.last_read_message

        const onConversationClick = async () => {
            if (isSelected) {
                setCurrentConversationId(undefined)
            } else {
                setCurrentConversationId(conversation.id)
                setHighlightedJob(jobs.find(job => job.id === conversation.related_job))
                await fetch(`/api/conversations/read?conversation_id=${conversation.id}&message=${lastMessage?.id}`)
                mutate('/api/conversations/get')
            }
        }

        return <div key={conversation.id} className={`${styles.conversation_card} ${isSelected ? styles.active : ''}`}
            onClick={onConversationClick}>
            <div className={styles.sender_row}>
                <UserAvatar s studio={conversation.studio_data} />
                {conversation.studio_data?.name}
                {hasNewMessages && <IconStatus red />}
                <span style={{ marginLeft: 'auto' }}>{formatDate(lastMessage?.date_created || '')}</span>
            </div>
            <div className={styles.card_content}>
                <div>{conversation.title}</div>
                <div>{lastMessage?.message}</div>
            </div>
        </div>
    }
    const ConversationsColumn = () => {

        const [conversationsLimit, setConversationsLimit] = useState(5)

        const sortedByDateConversations = filteredConversations || [].sort((j1: UIConversation, j2: UIConversation) => dateToMilis(j2.date_created) - dateToMilis(j1.date_created))

        return <div className={styles.column}>
            {!isMobile && <div className={styles.column_header}>SUBMISSIONS <span className={`${styles.column_counter} ${currentJob ? styles['column_counter--red'] : ''}`} onClick={() => currentJob && setCurrentJob(undefined)}>{filteredConversations.length}{currentJob && <IconFilter full />}</span></div>}
            {isMobile && <ColumnHeaderMobile />}

            {!filteredConversations.length ?
                <div className={`${styles['column_contents']} ${!jobs.length ? styles['column_contents--empty'] : ''}`}>
                    <EmptyColumn text={jobs.length ? 'Submissions from studios will be shown here.' : ''} />
                </div>
                :
                <div className={styles['column_contents']}>
                    {sortedByDateConversations.slice(0, conversationsLimit).map(conversation => conversationCard(conversation))}

                    {sortedByDateConversations.length > conversationsLimit ? <div style={{ textAlign: 'center' }}>
                        <div className='button_primary--inverted mb-4' onClick={() => setConversationsLimit(conversationsLimit + 10)}>
                            SHOW MORE
                        </div>
                    </div> : null}
                </div>
            }
        </div>
    }

    const messageCard = (message: Message) => {

        let studioData = {}

        const conversation = getConversationData(currentConversationId)
        if (conversation?.studio_data?.user === message.author.id) studioData = conversation.studio_data

        return <div key={message.id} className={styles.message} >
            <div>
                <UserAvatar s studio={studioData as VerifiedPartner} user={message.author} />
            </div>
            <div className={styles.message_container}>
                {message.message}
                {!!message.attachments?.length && <> <br /><br />
                    FILE ATTACHED
                    {message.attachments.map(attachment =>
                        <a key={attachment.directus_files_id.id} target="_blank" rel="noreferrer"
                            href={`${DB_URL}/assets/${attachment.directus_files_id.id}`}>
                            <IconFile red />
                            {` ${attachment.directus_files_id.filename_download}`}
                        </a>)}
                </>}
                <div>{formatDate(message.date_created)} {formatTime(message.date_created)}</div>
            </div>
        </div>
    }

    const ChatColumn = () => {

        const [messagesLimit, setMessagesLimit] = useState(10)
        const [inputRows, setInputRows] = useState(1)
        const [disabled, setDisabled] = useState(true)
        const [loading, setLoading] = useState(false)
        const [message, setMessage] = useState('')


        const converstionData = getConversationData(currentConversationId)
        const ParticipantsAvatars = () => {

            if (!currentJob || !currentJob?.managers.length) return null

            return <div className={styles.participants_container}>
                <UserAvatar xs studio={converstionData?.studio_data} />
                {currentJob?.managers.map(user => <UserAvatar key={user.id} xs user={user} />)}
                <UserAvatar xs user={{
                    first_name: currentJob.author_name,
                    last_name: '', id: currentJob.author_id || ""
                } as any} />
            </div>
        }

        const messages = converstionData?.messages || []

        const onTextInput = (event: React.BaseSyntheticEvent) => {

            const inputText = (event.currentTarget as HTMLInputElement).value

            if (inputText.indexOf('\n') !== -1 || inputText.length > event.target.clientWidth / 7) {
                setInputRows(4)
            } else {
                setInputRows(1)
            }

            setMessage(inputText)
            setDisabled(inputText.length === 0)
        }
        
        const sendMessage = async (event: React.FormEvent, message: string) => {
            event.preventDefault()
            
            setLoading(true)
            const formData = new FormData();
            formData.append('text', message)
            formData.append('envelope', JSON.stringify({ to: [`${currentConversationId}@reply.studios.decentraland.org`] }))
            formData.append('from', `<${user.email}>`)

            const postMessage = await fetch('/api/message', {
                method: "POST",
                body: formData
            })
            postMessage?.ok && await mutate('/api/conversations/get')
            setLoading(false)
        }

        const onEnterKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.code == "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(e, message)
            }
        }


        return <div className={styles.column}>
            {!isMobile && <div className={`${styles['column_header']} ${styles['column_header--chat']}`}><Link className={`button_primary ${styles.create_btn}`} href={CREATE_PROJECT_URL}>CREATE A PROJECT</Link></div>}
            <div className={`${styles['column_contents']} ${styles['column_contents--chat']} ${!jobs.length ? styles['column_contents--empty'] : ''}`} >
                <div className={styles['chat']}>
                    {!currentConversationId ?
                        <EmptyColumn text={conversations.length ? 'Select a message to read the conversation' : ''} />
                        :
                        <>
                            <div className={styles['chat_header']}>
                                <div>
                                    {isMobile && <BackButton small onClick={() => setCurrentConversationId(undefined)} />}
                                    <Link href={`/profile/${converstionData?.studio_data?.slug}`}>
                                        <UserAvatar s studio={converstionData?.studio_data} />
                                    </Link>
                                    <Link href={`/profile/${converstionData?.studio_data?.slug}`}>
                                        {converstionData?.studio_data?.name}
                                    </Link>
                                    <ParticipantsAvatars />
                                </div>
                                <Link className={styles.chat_headerLink} href={`/dashboard?id=${getConversationData(currentConversationId)?.related_job}`}>{getConversationData(currentConversationId)?.title}<IconOpenProject /></Link>
                            </div>

                            <div className={styles['chat_messages']}>
                                {messages.slice(messagesLimit >= messages.length ? 0 : messages.length - messagesLimit).reverse().map(message => messageCard(message))}

                                {messages.length > messagesLimit ? <div className={styles.load_older}>
                                    <div className='button_primary--inverted button_primary--small' onClick={() => setMessagesLimit(messagesLimit + 10)}>
                                        LOAD OLDER MESSAGES
                                    </div>
                                </div> : null}
                            </div>

                            <form onSubmit={(e) => sendMessage(e, message)} className={styles['chat_write']}>
                            {loading && <div className={styles.disabled}>
                                <Loader active/>
                            </div>}
                                <textarea placeholder='Write a message' name="text" rows={inputRows} onChange={onTextInput} onKeyDown={onEnterKey} value={message} disabled={loading}/>
                                <label>
                                    <input type="submit" disabled={disabled} />
                                    <IconSend gray={disabled} />
                                </label>
                                {/* <input type='file' name='attachments' multiple/> */}
                            </form>
                        </>
                    }
                </div>
            </div>
        </div>
    }

    const EmptyLayer = () => <>
        <div className={styles.empty_mask} />
        <div className={styles.empty_text}>
            Your projects, submissions, and messages with studios will be shown here. To begin collaborating with our studios and building in Decentraland, start a project.
            <br /><br /><Link className={`button_primary ${styles.create_btn}`} href={CREATE_PROJECT_URL}>START A PROJECT</Link>
        </div>
    </>

    const showJobsColumn = !isMobile || currentColumn === 'jobs'
    const showConversationsColumn = !isMobile || currentColumn === 'conversations' && !currentConversationId
    const showChatColumn = !isMobile || currentConversationId

    return <div className={styles.dashboard_container}>
        <div className={styles.dashboard}>
            {showJobsColumn && <JobsColumn />}
            {showConversationsColumn && <ConversationsColumn />}
            {showChatColumn && <ChatColumn />}

            {!jobs.length && <EmptyLayer />}
        </div>
    </div>
}
