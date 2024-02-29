import React, { FormEvent, useEffect, useState } from 'react'
import { mutate } from 'swr'
import router from 'next/router'
import Link from 'next/link'
import Script from 'next/script'

import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import styles from './JobSubmitForm.module.css'
import { Job } from '../../interfaces/Job'
import IconX from '../Icons/IconX'
import ErrorScreen from '../ErrorScreen/ErrorScreen'
import { fbq, linkedinTrackLead, plausibleTrackEvent } from '../utils'
import IconCalendar from '../Icons/IconCalendar'
import { useUser } from '../../clients/Sessions'
import Form from '../Form/Form'
import JobDetails from '../JobDetails/JobDetails'
import Signup from '../Signup/Signup'
import { User } from '../../interfaces/User'


const DESCRIPTION_MAX_LENGTH = 4000
const DESCRIPTION_MIN_LENGTH = 120

const descriptionOptions = [
    'Branded environment such as a store, arena, gallery, or headquarters',
    'A playable experience such as a game or a quest',
    'An event within Decentraland such as a product launch or conference',
    'Digital wearables for sale or giveaways',
    'Brand placement such as advertising billboards',
    'Education / masterclass for internal stakeholders',
    'I’m not sure — I need help defining my project'
]

const budgetOptions = [
    { budget: '0', text: 'Up to $1000' },
    { budget: '1000', text: '$1000 to $5000' },
    { budget: '5000', text: '$5000 to $20000' },
    { budget: '20000', text: '$20000 to $50000' },
    { budget: '50000', text: 'More than $50000' }
]

const initData: Job = {
    long_description: '',
    title: '',
    budget: '',
    short_description: [],
    id: '',
    date_created: '',
    author_name: '',
    company: '',
    email: '',
    deadline_date: '',
    messages: [],
    managers: [],
    status: 'published'
}

function JobSubmitForm() {

    const [formData, setFormData] = useState<Job>(initData)
    const [selectedFile, setSelectedFile] = useState<File>()
    const [fileValidationFail, setFileValidationFail] = useState(false)
    const [currentStep, setCurrentStep] = useState('startYourProject')
    const [loading, setLoading] = useState(false)
    const [fetchError, setFetchError] = useState<string>('')
    const { user } = useUser()
    const pendingJob = globalThis.localStorage?.pendingJob && JSON.parse(globalThis.localStorage.pendingJob)
    const [createdJob, setCreatedJob] = useState<Job>(initData)
    const [showPendingModal, setShowPendingModal] = useState(false)

    const remainCharsText = `${formData.long_description.length}/${DESCRIPTION_MAX_LENGTH}`

    const remainCharsColor = formData.long_description.length && formData.long_description.length <= DESCRIPTION_MIN_LENGTH

    const descriptionOk = formData.long_description !== '' && formData.long_description?.length >= DESCRIPTION_MIN_LENGTH

    const emptyFieldsStep1 = formData.title === '' || !formData.short_description.length || !descriptionOk || formData.budget === ''

    const emptyFieldsStep2 = formData.author_name === '' || formData.email === ''

    // const handleSubmitStep1 = (e: any) => {
    //     e.preventDefault()

    //     if (!emptyFieldsStep1) {
    //         plausibleTrackEvent('JobsSubmitForm: Step2', { slug: globalThis.sessionStorage.getItem('leadSlug') || 'jobs' })
    //         setCurrentStep(2)
    //     }
    // }

    const handleSubmitStep1 = async (e: any) => {
        e.preventDefault()

        setLoading(true)
        let postData = { ...formData }

        if (fileValidationFail) {
            setLoading(false)
            return alert('Please check slected file size.')
        }

        let fileUploaded = true
        if (selectedFile) {
            fileUploaded = false
            await fetch(`/api/upload`, {
                method: 'POST',
                headers: {
                    fileName: selectedFile.name,
                    folder: 'b06b8fa0-9f3f-495a-88f5-cacf33f321e3'
                },
                body: selectedFile,
            }).then(res => {
                if (res.ok) {
                    return res.json()
                } else {
                    setFetchError('file upload error')
                }
            }).then((res) => {
                if (res?.data) {
                    postData.brief_file = res.data
                    fileUploaded = true
                }
            })
        }

        const newFormData = {
            ...postData,
            author_name: user ? `${user.first_name} ${user.last_name}` : '',
            company: user ? user.company : '',
            email: user ? user.email : ''
        }

        setFormData(newFormData)

        // setFormData(postData)
        globalThis.localStorage.setItem('pendingJob', JSON.stringify(newFormData))

        if (user) {
            setCurrentStep('projectDraft')
        } else {
            setCurrentStep('signup')
        }
        setLoading(false)

        // createJob(postData)
    }

    const handleInput = (e: React.ChangeEvent) => {
        const element = e.target as HTMLInputElement
        let newValue: any = element.value

        if (element.id === 'short_description') {
            let newShortDescription = formData.short_description || []
            if (element.checked) {
                newShortDescription.push(newValue)
            } else {
                newShortDescription.splice(newShortDescription.indexOf(newValue), 1)
            }

            newValue = newShortDescription
        }

        setFormData({ ...formData, [element.id]: newValue })
    }

    const handleFileInput = (e: FormEvent<HTMLInputElement>) => {
        setFileValidationFail(false)

        if (e.currentTarget.files?.length) {
            if (e.currentTarget.files[0].size > 10000000) {
                setFileValidationFail(true)
            } else {
                setSelectedFile(e.currentTarget.files[0])
                setFileValidationFail(false)
            }
        } else {
            setSelectedFile(undefined)
        }
    }

    const handleFileRemove = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        setSelectedFile(undefined)
    }

    const handleCreatedUser = (userData: User) => {
        // console.log(userData)
        // setFormData({
        //     ...formData,
        //     author_name: `${userData.first_name} ${userData.last_name}`,
        //     company: userData.company,
        //     email: userData.email
        // })
        createJob({
            ...formData,
            author_name: `${userData.first_name} ${userData.last_name}`,
            company: userData.company,
            email: userData.email
        }, false)
    }

    const createJob = async (formData: Job, verified_email = true) => {

        const postJob = await fetch(`/api/jobs/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ job: formData, verified_email })
        })
            .then(res => res.ok && res.json())

        if (postJob.id) {
            // const lead = {
            //     name: formData.author_name,
            //     email: formData.email,
            //     slug: globalThis.localStorage.getItem('leadSlug') || 'jobs',
            //     mobile: !!globalThis?.navigator.userAgent.match(/Mobi/),
            //     user_agent: globalThis?.navigator.userAgent,
            //     list_ids: [ '3d1d6c43-5bd7-436e-a253-f61b6a728ae0' ],
            // }

            // fetch('/api/landing/submit', {
            //     method: 'POST',
            //     body: JSON.stringify(lead)
            // })

            // fbq('track', 'Lead')
            // linkedinTrackLead(globalThis.sessionStorage.getItem('leadConversionId') || '13935513') //web3 campaign conversion_id
            plausibleTrackEvent('JobsSubmitForm: Step3', { slug: globalThis.sessionStorage.getItem('leadSlug') || 'jobs', email: formData.email })
            globalThis.localStorage.removeItem('pendingJob')

            setCreatedJob(postJob)
            await mutate('/api/conversations/get')

            if (!verified_email) {
                setCurrentStep('userCreated')
            } else {
                setCurrentStep('projectCreated')
            }

            setLoading(false)
        } else {
            setFetchError('job creation error')
        }
    }

    useEffect(() => {
        const leadName = globalThis.localStorage.getItem('leadName')
        const leadEmail = globalThis.localStorage.getItem('leadEmail')
        const landingUrl = JSON.parse(globalThis.sessionStorage.getItem('navHist') || '[]')[0]
        
        let extraFields: any = {}
        leadName && (extraFields['author_name'] = leadName)
        leadEmail && (extraFields['email'] = leadEmail)
        landingUrl && (extraFields['landing_url'] = landingUrl)

        setFormData({ ...formData, ...extraFields })
    }, [])

    useEffect(() => {
        fbq('init', '1591258994727531');
        fbq('trackSingle', '1591258994727531', 'PageView');
    }, [(globalThis as any).fbq])

    const ExamplesModal = ({ children }: { children: string }) => {
        const [open, setOpen] = useState(false)
        const [page, setPage] = useState(1)
        const [scrollY, setScrollY] = useState('')

        useEffect(() => {
            const close = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    setOpen(false)
                }
            }
            window.addEventListener('keydown', close)
            return () => window.removeEventListener('keydown', close)
        }, [])

        const handleOpenModal = () => {
            setScrollY(`calc(${globalThis.scrollY}px + 5vh)`)
            setOpen(true)
        }

        return <>
            <span className={styles.link}
                onClick={() => handleOpenModal()}>
                <u>{children}</u>
            </span>
            {open && <>
                <div className={styles.modalBackground} onClick={() => setOpen(false)} />
                <div className={styles.examplesModal}
                    style={{ top: scrollY }}
                    onBlur={() => setOpen(false)}>
                    {page === 1 ?
                        <>
                            <div className={styles.examplesTitleBar}>Example of a clear project description <IconX gray onClick={() => setOpen(false)} /></div>
                            <div className={styles.examplesContents}>
                                <i>
                                    Goals:
                                    <ul>
                                        <li>Create an engaging virtual experience that showcases our latest fashion collections and attracts a younger and tech-savvy audience.</li>
                                        <li>Increase brand awareness and engagement by providing an interactive and immersive experience.</li>
                                        <li>Establish a presence in the Metaverse and demonstrate our commitment to innovation and technology.</li>
                                    </ul>
                                    Target Audience:
                                    <ul>
                                        <li>Tech-savvy millennials and Gen Z consumers interested in fashion and virtual experiences.</li>
                                    </ul>
                                    General User Journey:
                                    <ul>
                                        <li>Users will enter our virtual store and be greeted by a personalized avatar shopping assistant.</li>
                                        <li>They will be able to browse through our latest collections, including clothing, accessories, and cosmetics.</li>
                                        <li>They can try on virtual clothing and accessories, mix and match outfits, and customize their avatar&apos;s appearance.</li>
                                    </ul>
                                    Deadline:
                                    <ul>
                                        <li>The project should be completed within 4 months, with a soft launch in 3 months and a full launch in 4 months.</li>
                                    </ul>
                                </i>
                                <div className={styles.link} onClick={() => setPage(2)}>Read tips on writing a description</div>
                            </div>
                        </>
                        :
                        <>
                            <div className={styles.examplesTitleBar}>Tips for writing a clear project description <IconX gray onClick={() => setOpen(false)} /></div>
                            <div className={styles.examplesContents}>
                                <ol>
                                    <li>
                                        Write a short introduction
                                        <div>Start with a clear and concise summary of the project, including its purpose, goals, and target audience.</div>
                                    </li>
                                    <li>
                                        Provide detailed information
                                        <div>Write down the details about the experience you want to create, including its look and feel, interactive features, and overall user journey.</div>
                                    </li>
                                    <li>
                                        Define a timeline
                                        <div>When should this project go live? State a deadline for your projects so that studios know how much time they would have to work on it.</div>
                                    </li>
                                    <li>
                                        Style
                                        <div>Explain any branding or style guidelines that the studio should adhere to when designing the project.</div>
                                    </li>
                                    <li>
                                        References and examples
                                        <div>If you know any examples or references that inspire you, share them as a link in the description.</div>
                                    </li>
                                </ol>
                                <div className={styles.link} onClick={() => setPage(1)}>Read example description</div>
                            </div>
                        </>}
                </div>
            </>}
        </>
    }


    useEffect(() => {
        if (user && pendingJob) {
            setShowPendingModal(true)
        }
    }, [user])

    const PendingProjetModal = () => {

        const loadPendingProject = () => {
            const author_name = user ? `${user.first_name} ${user.last_name}` : ''
            const company = user ? user.company : ''
            const email = user ? user.email : ''
            setFormData({
                ...pendingJob,
                author_name,
                company,
                email
            })
            setCurrentStep('projectDraft')
            setShowPendingModal(false)
        }

        const discard = () => {
            globalThis.localStorage.removeItem('pendingJob')
            setShowPendingModal(false)
        }

        return <>
            <div className={styles.modalOverlay} />
            <div className={styles.modalContainer}>
                <div className={styles.modalTitle}>Would you like to continue editing your project draft?</div>
                <div><b>You have an unpublished draft</b> project that you started working on. If you discard the draft, your current progress will be lost.</div>
                <div className={styles.modalButtons}>
                    <div className='button_primary--inverted' onClick={loadPendingProject}>CONTINUE EDITING</div>
                    <div className='button_primary--inverted' onClick={discard}>DISCARD AND START NEW PROJECT</div>
                </div>
            </div>
        </>
    }

    if (fetchError) {
        console.log(fetchError)
        return <ErrorScreen button={<Link className="button_primary--inverted" href="/">GO TO HOME</Link>}
            onBackClick={() => {
                setFetchError('')
                setLoading(false)
            }} />
    }

    if (loading) {
        return <Loader active>Loading...</Loader>
    }

    // if (user && pendingJob) {
    //     // createJob(JSON.parse(pendingJob) as Job)
    //     setFormData(pendingJob)
    //     setCurrentStep('projectDraft')
    // }

    if (currentStep === 'signup') {
        globalThis.window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })

        return <Signup logo={false}
            onBack={() => setCurrentStep('startYourProject')}
            customName='START A PROJECT'
            customStepCount={4}
            customStepOffset={1}
            customStepStart={1}
            email_verification={false}
            onSuccess={(user) => handleCreatedUser(user)} />
    }

    if (currentStep === 'userCreated') {
        return <div className={styles.container}>
            <Form onBack={() => setCurrentStep('startYourProject')}
                stepNumber={4}
                stepsCount={4}
                name='START A PROJECT'
                stepTitle='Verify your email' >
                <img alt='Check your email' src="/images/form_envelope.webp" />
                <Form.Label>
                    Please confirm your publication by clicking on a link we sent you via email to <b>{createdJob.email}</b>
                </Form.Label>
            </Form>
        </div>
    }

    if (currentStep === 'projectDraft') {
        if (!user) {
            router.push('/')
        }
        return <div className={styles.container}>
            <Form stepNumber='4' stepsCount='4'
                name='START A PROJECT'
                stepTitle='Review your project'
                stepDescription='Take a final look at your project. If you are happy with it, publish it by clicking the button below.' >
                <div className={styles['container--card']}>
                    <JobDetails jobData={formData} />
                </div>
                <div className={`${styles['container--publish']}`}>
                    <div>
                        Once your project is published, you will not be able to edit it. You can close it if you want to stop receiving submissions.
                    </div>
                    <div className={styles['container--buttons']}>
                        <span className='button_primary' onClick={() => createJob(formData)}>PUBLISH PROJECT</span>
                        <span className='button_primary--inverted' onClick={() => setCurrentStep('startYourProject')}>CONTINUE EDITING</span>
                    </div>
                </div>
            </Form>
        </div>
    }

    if (currentStep === 'projectCreated') {
        return <div className={styles.verify_container}>
            <img className={styles.verify_image} alt='Your job post is live' src="/images/item_ok.png" />

            <div className={styles.verify_title}>
                You published a new project!
            </div>
            <div className={styles.verify_subtitle}>
                Your project is now visible to all Decentraland Studios.
            </div>

            <Link href={`/dashboard?id=${createdJob.id}`}><div className='button_primary'>MANAGE YOUR PROJECT</div></Link>
            <div className={styles.verify_factsContainer}>
                <div className={styles.verify_factCard}>
                    <img className={styles.verify_factIcon} alt='calendar' src="/images/iconCalendar.png" />
                    <div className={styles.verify_factText}>
                        <b>Your project will be available for 30 days.</b> If you need to remove it sooner, you can close it on your project profile.
                    </div>
                </div>
                <div className={styles.verify_factCard}>
                    <img className={styles.verify_factIcon} alt='calendar' src="/images/iconCard.png" />
                    <div className={styles.verify_factText}>
                        <b>You will receive email notifications</b> when studios apply to work with you. Talk to them through your dashboard.
                    </div>
                </div>
            </div>
        </div>
    }



    //startYourProject
    return <div className={styles.container}>
        {showPendingModal && <PendingProjetModal />}
        <Form stepNumber='1' stepsCount='4'
            showBackButton
            onSubmit={handleSubmitStep1}
            name='START A PROJECT'
            stepTitle='About your project'
            stepDescription='Provide some details about your project and the skills you need. Once you publish it, verified Decentraland Studios will apply to work with you.' >
            <Form.Label>Project title</Form.Label>
            <Form.InputText
                required id="title"
                value={formData.title}
                placeholder='Modern-looking building to promote my brand'
                onChange={handleInput} />

            <Form.Label>Which of the following best describes your project?</Form.Label>

            {descriptionOptions.map(text => <div key={text}><label className={styles.options}>
                <input type="checkbox" id="short_description"
                    value={text}
                    onChange={handleInput}
                    checked={formData.short_description?.includes(text)} />
                {text}</label></div>)}

            <Form.Label>Describe your project</Form.Label>
            <div className={styles.text}>
                Explain in detail the type of experience you want to create. Here are some <ExamplesModal>tips on writing clear project descriptions.</ExamplesModal>
            </div>
            <textarea
                className={styles.input_long}
                required
                maxLength={DESCRIPTION_MAX_LENGTH}
                id="long_description"
                value={formData.long_description}
                onChange={handleInput}
                placeholder="I’m looking to create a building in Decentraland to promote our brand and highlight our values and mission..."
            />
            <Form.FieldMessage red={!!remainCharsColor} message={descriptionOk ? remainCharsText : `Write ${120 - formData.long_description.length} more characters`} />

            {/* <Form.Label>Upload a brief (optional)</Form.Label>
            <div className={styles.text}>
                If you already have a document that describes your project upload it here.
            </div>
            <label className={styles.input_file}>
                <input type='file' id="brief_file" accept=".pdf" onChange={handleFileInput} onClick={(event: React.MouseEvent<HTMLInputElement>) => event.currentTarget.value = ''} />
                <span className='button_primary--inverted'>SELECT FILE</span>
                <span className='ml-1'>{selectedFile ? <>{selectedFile.name} <IconX gray className='ml-1' style={{ height: '11px', width: '11px' }} onClick={handleFileRemove} /></> : 'No file selected.'}</span>
            </label>
            <Form.FieldMessage red={fileValidationFail} icon="info" message="PDF files only, maximum size is 10 MB." /> */}

            <Form.Label>What is your budget for this project?</Form.Label>

            {budgetOptions.map((option) => <div key={option.text}><label className={styles.options}>
                <input type="radio" id="budget"
                    value={option.budget}
                    onChange={handleInput}
                    checked={formData.budget === option.budget} />
                {option.text}</label></div>)}

            <Form.Label>Indicate your deadline for this project (optional)</Form.Label>
            <div className={styles.text}>
                Write the date by which you expect to complete this project. If you have no clear deadline, mention a rough estimate.
            </div>
            <span style={{ position: 'relative' }}>

                <Form.InputText type="text"
                    id="deadline_date"
                    value={formData.deadline_date}
                    placeholder="Three months from now"
                    onChange={handleInput} />

                <IconCalendar className={styles['input_date--Icon']} />

                <input className={styles.input_date} type="date"
                    id="deadline_datePicker"
                    onChange={(e) => {
                        setFormData({ ...formData, deadline_date: e.currentTarget.value })
                    }} />
            </span>

            <Form.ButtonSubmit disabled={emptyFieldsStep1} value="NEXT" />

        </Form>


        <footer>
            <Script id="linkedin-partner_id" strategy="afterInteractive">
                {`_linkedin_partner_id = "5518009";
                window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
                window._linkedin_data_partner_ids.push(_linkedin_partner_id);`}
            </Script>
            <Script id="linkedin-tracking" strategy="afterInteractive">
                {`(function(l) {
                if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
                window.lintrk.q=[]}
                var s = document.getElementsByTagName("script")[0];
                var b = document.createElement("script");
                b.type = "text/javascript";b.async = true;
                b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
                s.parentNode.insertBefore(b, s);})(window.lintrk);`}
            </Script>
            <noscript>
                <img height="1" width="1" style={{ display: "none" }} alt="" src={`https://px.ads.linkedin.com/collect/?pid=5518009&fmt=gif`} />
            </noscript>
        </footer>
    </div>

}

export default JobSubmitForm
