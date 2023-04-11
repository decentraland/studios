import React, { useState } from 'react'

import styles from './JobSubmitForm.module.css'
import { Job } from '../../interfaces/Job'
import BackButton from '../BackButton/BackButton'
import IconInfo from '../Icons/IconInfo'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

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

    const initData: Job = {
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

    const [formData, setFormData] = useState(initData)
    const [currentStep, setCurrentStep] = useState(1)
    const [loading, setLoading] = useState(false)

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

        const verification = await fetch(`/api/jobs/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ job: formData }),
        })
        if (verification.ok) {
            setCurrentStep(3)
            setLoading(false)
        } else {
            console.log(verification)
        }
    }

    const handleInput = (e: React.FormEvent) => {
        const element = e.currentTarget as HTMLInputElement
        let newValue: any = element.value

        if (element.name === 'budget'){
            setFormData({ 
                ...formData, 
                budget_min: element.value.split(',')[0],
                budget_max: element.value.split(',')[1] 
            })
            return
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

    const RequiredMark = () => <span style={{color: 'red'}}>*</span>

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
            <label className={styles.label}>Project title <RequiredMark /></label>
            <input className={styles.input} type="text" 
                required name="title" 
                value={formData.title} 
                placeholder='Modern-looking building to promote my brand'
                onChange={handleInput} />

            <label className={styles.label}>Which of the following best describes your project? <RequiredMark /></label>

            {descriptionOptions.map(text => <div key={text}><label className={styles.options}>
                <input type="checkbox" name="short_description"
                    value={text}
                    onChange={handleInput}
                    checked={formData.short_description?.includes(text)} />
                {text}</label></div>)}


            <label className={styles.label}>Describe your project <RequiredMark /></label>
            <div className={styles.text}>
                Use this space to explain the type of experience you want to create. Describe your project as detailed as you can!
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

            <label className={styles.label}>Which of the following best describes your project? <RequiredMark /></label>

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
            <label className={styles.label}>What’s your email? <RequiredMark /></label>
            <input className={styles.input} type="text" 
                required name="email" 
                value={formData.email} 
                onChange={handleInput} />
            <div className={styles.text_secondary}><IconInfo gray /> Your email will only be visible to studios that apply to your job</div>
            
            <label className={styles.label}>What’s your name? <RequiredMark /></label>
            <input className={styles.input} type="text" 
                required name="author_name" 
                value={formData.author_name} 
                onChange={handleInput} />
            
            <label className={styles.label}>What’s your company?</label>
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
