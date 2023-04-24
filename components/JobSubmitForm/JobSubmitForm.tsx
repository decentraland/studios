import React, { ChangeEvent, useEffect, useState } from 'react'

import styles from './JobSubmitForm.module.css'
import { Job } from '../../interfaces/Job'
import BackButton from '../BackButton/BackButton'
import IconInfo from '../Icons/IconInfo'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import IconX from '../Icons/IconX'
import Link from 'next/link'
import ErrorScreen from '../ErrorScreen/ErrorScreen'

const DESCRIPTION_MAX_LENGTH = 4000

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
    {budget: ['0', '1000'] , text: 'Up to $1000'},
    {budget: ['1000', '5000'] , text: '$1000 to $5000'},
    {budget: ['5000', '2000'] , text: '$5000 to $20000'},
    {budget: ['20000', '50000'] , text: '$20000 to $50000'},
    {budget: ['50000', '0'] , text: 'More than $50000'}
]

function JobSubmitForm() {

    const initData = {
        long_description: '',
        title: '',
        budget_min: '',
        budget_max: '',
        short_description: [],
        id: '',
        date_created: '',
        author_name: '',
        company: '',
        email: ''
    }

    const [formData, setFormData] = useState<Job>(initData)
    const [selectedFile, setSelectedFile] = useState<File>()
    const [fileError, setFileError] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [fetchError, setFetchError] = useState<string>('')

    const remainCharsText = `${formData.long_description.length}/${DESCRIPTION_MAX_LENGTH}`

    const emptyFieldsStep1 = formData.title === '' || !formData.short_description.length || formData.long_description === '' || formData.budget_max === '' || formData.budget_min === ''
    
    const emptyFieldsStep2 = formData.author_name === '' || formData.email === ''

    const onBackButtonPress = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        
        if (currentStep === 2){
            setCurrentStep(1)
        }
    }

    const handleSubmitStep1 = (e: React.FormEvent) => {
        e.preventDefault()

        !emptyFieldsStep1 && setCurrentStep(2)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        setLoading(true)
        let postData = {...formData}

        if (fileError){
            setLoading(false)
           return alert('Please check slected file size.')
        }

        if (selectedFile){
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
            }).then(({ data }) => postData.brief_file = data.id)
        }

        const jobCreate = await fetch(`/api/jobs/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ job: postData }),
        })

        if (jobCreate.ok) {
            setCurrentStep(3)
            setLoading(false)
        } else {
            setFetchError('job creation error')
        }
    }

    const handleInput = (e: React.FormEvent) => {
        const element = e.currentTarget as HTMLInputElement
        let newValue: any = element.value

        if (element.name === 'budget'){
            return setFormData({ 
                ...formData, 
                budget_min: element.value.split(',')[0],
                budget_max: element.value.split(',')[1] 
            })
        }

        if (element.name === 'short_description') {
            let newShortDescription = formData.short_description || []
            if (element.checked) {
                newShortDescription.push(element.value)
            } else {
                newShortDescription.splice(newShortDescription.indexOf(element.value), 1)
            }

            newValue = newShortDescription
        }

        setFormData({ ...formData, [element.name]: newValue })
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

    const ExamplesModal = ({children}: {children: string}) => {
        const [open, setOpen] = useState(false)
        const [page, setPage] = useState(1)

        useEffect(() => {
            const close = (e: KeyboardEvent) => {
              if(e.key === 'Escape'){
                setOpen(false)
              }
            }
            window.addEventListener('keydown', close)
          return () => window.removeEventListener('keydown', close)
        },[])
        
        return <>
            <div className={styles.link}
            onClick={() => setOpen(true)}>
            {children}
            </ div>
            {open && <>
            <div className={styles.modalBackground} onClick={() => setOpen(false)}/>
            <div className={styles.examplesModal}
                onBlur={() => setOpen(false)}>
                    {page === 1 ? 
                        <>
                        <div className={styles.examplesTitleBar}>Example of a clear project description <IconX gray onClick={() => setOpen(false)}/></div>
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
                        <div className={styles.examplesTitleBar}>Tips for writing a clear project description <IconX gray onClick={() => setOpen(false)}/></div>
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

    if(fetchError){
        console.log(fetchError)
        return <ErrorScreen button={<Link className="button_primary--inverted" href="/jobs">GO TO JOBS</Link>}
                 onBackClick={() => { 
                    setFetchError('')
                    setLoading(false)
                }} />
    }

    if (loading){
        return <Loader active>Loading...</Loader>
    }

    if (currentStep === 3) {
        return <div className={styles.confirm_container}>
            <img alt='Check your email' src="/images/check_mail.png" />
            <div className={styles.confirm_title}>
                Confirm your job post
            </div>
            <div className={styles.confirm_text}>
                Thank you for creating a job post! Please confirm your publication by clicking on a link we sent you via email to <b>{formData.email}</b>
            </div>
        </div>
    }

    return <div className={styles.container}>
            
            <BackButton { ... (currentStep === 2 ? {onClick: onBackButtonPress} : {}) }  /> 
        
        <div className={styles.formContainer}>
        <div className={styles.title}>
            Create a Job post
        </div>
        <div className={styles.description}>
            Provide some details about your project and the skills you need. Once you publish it, your job post will be visible to all Decentraland Studios.
        </div>

        {currentStep === 1 ? <form onSubmit={handleSubmitStep1}>
            <label className={styles.label}>Project title</label>
            <input className={styles.input} type="text" 
                required name="title" 
                value={formData.title} 
                placeholder='Modern-looking building to promote my brand'
                onChange={handleInput} />

            <label className={styles.label}>Which of the following best describes your project?</label>

            {descriptionOptions.map(text => <div key={text}><label className={styles.options}>
                <input type="checkbox" name="short_description"
                    value={text}
                    onChange={handleInput}
                    checked={formData.short_description?.includes(text)} />
                {text}</label></div>)}

            <label className={styles.label}>Describe your project</label>
            <div className={styles.text}>
            Explain in detail the type of experience you want to create. Here are some <ExamplesModal>tips on writing clear project descriptions.</ExamplesModal>
            </div>
            <textarea
                className={styles.input_long}
                required
                maxLength={DESCRIPTION_MAX_LENGTH}
                name="long_description"
                value={formData.long_description}
                onChange={handleInput}
                placeholder="I’m looking to create a building in Decentraland to promote our brand and highlight our values and mission..."
            />
            <div className={styles.text_secondary}>{remainCharsText}</div>

            <label className={styles.label}>Upload a brief (Optional)</label>
            <div className={styles.text}>
                If you already have a document that describes your project upload it here.
            </div>
            <label className={styles.input_file}>
                <input type='file' name="brief_file" accept=".pdf" onChange={handleFileInput} onClick={(event: React.MouseEvent<HTMLInputElement>)  => event.currentTarget.value = ''}/>
                <span className='button_primary--inverted'>SELECT FILE</span>
                <span className='ml-1'>{selectedFile ? <span>{selectedFile.name} <IconX gray className='ml-1' style={{height: '11px', width: '11px'}} onClick={handleFileRemove}/></span> : 'No file selected.'}</span>
            </label>
            <div className={styles.text_secondary} style={fileError ? {color: '#FF2D55'} : {}}><IconInfo gray={!fileError} /> PDF files only, maximum size is 10 MB.</div>

            <label className={styles.label}>What is your budget for this project?</label>

            {budgetOptions.map((option) => <div key={option.text}><label className={styles.options}>
                <input type="radio" name="budget"
                    value={option.budget}
                    onChange={handleInput}
                    checked={formData.budget_min === option.budget[0] && formData.budget_max === option.budget[1]} />
                {option.text}</label></div>)}

            <input
                className={`${styles.submit_btn} ${emptyFieldsStep1 ? styles.submit_btn_disabled : ''}`}
                disabled={emptyFieldsStep1}
                type="submit"
                value="NEXT"
            />
        </form> 
        :
        <form onSubmit={handleSubmit}>
            <label className={styles.label}>What’s your email?</label>
            <input className={styles.input} type="text" 
                required name="email" 
                value={formData.email} 
                onChange={handleInput} />
            <div className={styles.text_secondary}><IconInfo gray /> Your email will only be visible to studios that apply to your job</div>
            
            <label className={styles.label}>What’s your name?</label>
            <input className={styles.input} type="text" 
                required name="author_name" 
                value={formData.author_name} 
                onChange={handleInput} />
            
            <label className={styles.label}>What’s your company? (Optional)</label>
            <input className={styles.input} type="text" 
                name="company" 
                value={formData.company} 
                onChange={handleInput} />

            <input
                className={`${styles.submit_btn} ${emptyFieldsStep2 ? styles.submit_btn_disabled : ''}`}
                disabled={emptyFieldsStep2}
                type="submit"
                value="CREATE JOB POST"
            />
        </form>        
}
    </div>
    </div>

}

export default JobSubmitForm
