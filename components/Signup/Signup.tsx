import React, { useState } from 'react'

import styles from './Signup.module.css'
import { useRouter } from 'next/router'
import Form from '../Form/Form'
import Link from 'next/link'
import { User } from '../../interfaces/User'

const CLIENT_ROLE = '525f6b3a-0379-4636-ad16-4c719283c2b5'
const JOIN_REGISTRY_URL = process.env.NEXT_PUBLIC_JOIN_REGISTRY_URL

interface Props {
    customStepOffset?: number
    customStepCount?: number
    customName?: string
    customStepStart?: number
    logo?: boolean
    onBack?: () => void
    email_verification?: boolean,
    onSuccess?: (user: User) => void
}

export default function Signup({ customStepOffset = 0, customStepCount, customName, customStepStart = 0, logo = true, onBack, email_verification = true, onSuccess }: Props) {
    const router = useRouter()

    const [currentStep, setCurrentStep] = useState(customStepStart)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConfirm, setPasswordConfirm] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setlastName] = useState('')
    const [company, setCompany] = useState('')

    const passwordInvalid = !!password && (password.length <= 7)
    const passwordConfirmError = !!password && !!passwordConfirm && (password !== passwordConfirm)
    const disableSubmit = !email || !password || !passwordConfirm || passwordInvalid || passwordConfirmError

    const IconCLients = React.memo(() => {
        return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M0.898849 16.4335C2.29673 18.4424 5.38546 19.1288 7.36091 17.756C9.0685 16.5674 9.44514 14.7259 8.31514 13.1188C7.30231 11.6623 5.46916 11.2521 4.26381 12.1143C2.8743 13.102 3.43512 14.458 2.58133 15.0608C1.86983 15.5713 1.37597 15.2533 0.965813 15.5295C0.697956 15.6969 0.59751 16.015 0.898849 16.4335ZM8.63321 11.8799C9.24428 12.491 9.70464 13.3029 9.8135 13.9642C10.4915 13.8554 11.0356 13.5373 11.6048 12.9681C11.6969 12.8844 11.7806 12.7923 11.8643 12.6918C11.4959 10.6745 9.8135 9.01719 7.82966 8.6489C7.72921 8.73261 7.63713 8.82469 7.54505 8.91676C6.97585 9.48597 6.66615 10.0468 6.55733 10.708C7.21023 10.8168 8.03057 11.2689 8.63321 11.8799ZM16.5266 1.92735C16.0997 2.23706 11.4457 5.42624 8.59135 7.94577C10.4831 8.54008 11.9647 10.0133 12.5674 11.9301C15.1036 9.07576 18.2844 4.43014 18.5941 3.99488C19.5819 2.61374 17.8576 0.939629 16.5266 1.92735Z" fill="#CAC7C8" />
        </svg>
    })

    IconCLients.displayName = 'IconClients'
    
    const IconStudios = React.memo(() => {
        return <svg xmlns="http://www.w3.org/2000/svg" width="22" height="20" viewBox="0 0 22 20" fill="none">
            <g clipPath="url(#clip0_6441_34873)">
                <path d="M0.285645 13.926C0.285645 16.2614 2.37828 18.0108 4.93966 18.0108C7.49264 18.0108 9.57693 16.2614 9.57693 13.926V11.7831C9.98707 11.6241 10.4809 11.532 10.9748 11.532C11.5189 11.532 11.9876 11.5906 12.3644 11.7246V13.926C12.3644 16.2614 14.4486 18.0108 17.0016 18.0108C19.5546 18.0108 21.6556 16.2614 21.6556 13.926C21.6556 13.3149 21.5636 12.7458 21.2204 11.9506L17.7466 3.84787C17.2694 2.7597 16.2734 2.12354 15.0178 2.12354C13.4106 2.12354 12.3644 3.14474 12.3644 4.67655V5.48849C11.9458 5.37967 11.4854 5.32108 10.9748 5.32108C10.4894 5.32108 10.0206 5.39642 9.57693 5.53872V4.67655C9.57693 3.14474 8.53064 2.12354 6.92348 2.12354C5.6679 2.12354 4.66344 2.7597 4.19469 3.84787L0.712542 11.9506C0.36935 12.7458 0.285645 13.3149 0.285645 13.926ZM1.59982 13.926C1.59982 12.2435 3.04792 11.0968 4.93966 11.0968C6.82303 11.0968 8.32136 12.2435 8.32136 13.926C8.32136 15.6085 6.82303 16.7552 4.93966 16.7552C3.04792 16.7552 1.59982 15.6085 1.59982 13.926ZM13.6199 13.926C13.6199 12.2435 15.1099 11.0968 17.0016 11.0968C18.885 11.0968 20.3331 12.2435 20.3331 13.926C20.3331 15.6085 18.885 16.7552 17.0016 16.7552C15.1099 16.7552 13.6199 15.6085 13.6199 13.926ZM9.57693 9.23014V8.09172C10.0206 7.94943 10.4894 7.88247 10.9748 7.88247C11.4854 7.88247 11.9458 7.93269 12.3644 8.0415V9.16314C11.9876 9.03757 11.5273 8.979 10.9748 8.979C10.4809 8.979 9.98707 9.07107 9.57693 9.23014Z" fill="#CAC7C8" />
            </g>
            <defs>
                <clipPath id="clip0_6441_34873">
                    <rect width="21.37" height="16.582" fill="white" transform="translate(0.285645 1.42871)" />
                </clipPath>
            </defs>
        </svg>
    })
    
    IconStudios.displayName = 'IconStudios'

    const goToPrevPage = (logged = false) => {
        let navHist = JSON.parse(globalThis.sessionStorage.navHist || '[]')

        if (navHist.length > 1) {
            navHist.pop()

            if (!logged) {
                navHist = navHist.filter((e: string) => !(e.includes('/jobs/list') || e === '/login'))
            }

            router.push(navHist.pop())
        } else {
            router.push('/')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        fetch('/api/user/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password,
                first_name: firstName,
                last_name: lastName,
                company,
                role: CLIENT_ROLE,
                status: 'draft',
                user_agent: globalThis?.navigator.userAgent,
                email_verification: email_verification
            })
        }).then((res) => res.ok && res.json())
            .then((user: User) => {
                if (onSuccess) {
                    onSuccess(user)
                } else {
                    goToStep(3)
                }
            })
    }

    const goToStep = (step: number, e?: React.FormEvent) => {
        e && e.preventDefault()

        if (step >= customStepStart) {
            setCurrentStep(step)
        } else {
            if (onBack) {
                onBack()
            } else {
                goToPrevPage()
            }
        }
    }

    if (currentStep === 1) {
        return <div className={styles.container}>
            <Form onBack={() => goToStep(0)}
                logo={logo}
                onSubmit={(e) => goToStep(2, e)}
                stepNumber={customStepOffset + 1}
                stepsCount={customStepCount || '3'}
                name={customName || 'SIGNUP'}
                stepTitle='Create your account' >

                <Form.Label>Your email</Form.Label>
                <Form.InputText required
                    type='email'
                    value={email}
                    placeholder="studioname@studio.com"
                    onChange={(e) => setEmail(e.currentTarget.value)} />

                <Form.Label>Create a password</Form.Label>
                <Form.InputText required
                    type='password'
                    value={password}
                    placeholder="*******"
                    onChange={(e) => setPassword(e.currentTarget.value)} />
                <Form.FieldMessage message='8 Characters minimum'
                    icon="info"
                    red={passwordInvalid} />

                <Form.Label>Confirm your password</Form.Label>
                <Form.InputText required
                    type='password'
                    value={passwordConfirm}
                    placeholder="*******"
                    onChange={(e) => setPasswordConfirm(e.currentTarget.value)} />
                <Form.FieldMessage message={passwordConfirmError ? "Please verify password and confirmation" : ""}
                    icon={passwordConfirmError ? "info" : ""}
                    red />

                <Form.ButtonSubmit disabled={disableSubmit}
                    value="CONTINUE" />

                <div className={styles.text}>Already have an account? <Link href="/login">Log in</Link></div>
            </Form>
        </div>
    }

    if (currentStep === 2) {
        return <div className={styles.container}>
            <Form onBack={() => goToStep(1)}
                logo={logo}
                onSubmit={handleSubmit}
                stepNumber={customStepOffset + 2}
                stepsCount={customStepCount || '3'}
                name={customName || 'SIGNUP'}
                stepTitle='Tell us a bit about you' >

                <Form.Label>First name</Form.Label>
                <Form.InputText required
                    value={firstName}
                    placeholder="Your first name"
                    onChange={(e) => setFirstName(e.currentTarget.value)} />

                <Form.Label>Last name</Form.Label>
                <Form.InputText required
                    value={lastName}
                    placeholder="Your last name"
                    onChange={(e) => setlastName(e.currentTarget.value)} />

                <Form.Label>Company name</Form.Label>
                <Form.InputText required
                    value={company}
                    placeholder="Example company"
                    onChange={(e) => setCompany(e.currentTarget.value)} />

                <Form.ButtonSubmit disabled={disableSubmit}
                    value="CONTINUE" />
            </Form>
        </div>
    }

    if (currentStep === 3) {
        return <div className={styles.container}>
            <Form onBack={() => goToPrevPage()}
                logo={logo}
                // onSubmit={handleSubmit}
                stepNumber={customStepOffset + 3}
                stepsCount={customStepCount || '3'}
                name={customName || 'SIGNUP'}
                stepTitle='Verify your email' >
                <img alt='Check your email' src="/images/form_envelope.webp" />
                <Form.Label>
                    Please confirm your account by clicking on a link we sent you via email to <b>{email}</b>. If you haven&apos;t received an email in 5 minutes, check your spam, <a className='text-red underline' onClick={handleSubmit}>resend</a>, or <a className='text-red underline' onClick={() => goToStep(1)}>try a different email</a>.
                </Form.Label>
            </Form>
        </div>
    }

    return <div className={styles.container}>
        <Form onBack={goToPrevPage}
            logo={logo}
            stepTitle='Choose your profile' >
            <div className={styles.profilesContainer}>
                <div className={styles.profile} onClick={() => setCurrentStep(1)}>
                    <IconCLients />
                    <div className={styles['profile--title']}>Client</div>
                    <div className={styles['profile--description']}>
                        I want to hire talent for a project in decentraland.
                    </div>
                </div>

                <a className={styles.profile} href={JOIN_REGISTRY_URL} target="_blank" rel="noreferrer">
                    <IconStudios />
                    <div className={styles['profile--title']}>Studio</div>
                    <div className={styles['profile--description']}>
                        I’m a creative working in Decentraland and looking for new projects
                    </div>
                </a>
            </div>
            <div className={styles.text}>Already have an account? <Link href="/login">Log in</Link></div>
        </Form>
    </div>
}