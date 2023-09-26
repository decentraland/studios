import React, { useState } from 'react'

import styles from './SignupClient.module.css'
import { useRouter } from 'next/router'
import Form from '../Form/Form'
import Link from 'next/link'

const CLIENT_ROLE = '525f6b3a-0379-4636-ad16-4c719283c2b5'
const JOIN_REGISTRY_URL = process.env.NEXT_PUBLIC_JOIN_REGISTRY_URL


export default function Signup() {
    const router = useRouter()

    const [currentStep, setCurrentStep] = useState(0)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConfirm, setPasswordConfirm] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setlastName] = useState('')
    const [company, setCompany] = useState('')

    const passwordInvalid = !!password && (password.length <= 7)
    const passwordConfirmError = !!password && !!passwordConfirm && (password !== passwordConfirm)
    const disableSubmit = !email || !password || !passwordConfirm || passwordInvalid || passwordConfirmError


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
        fetch('/api/user/register', {
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
                user_agent: globalThis?.navigator.userAgent
            })
        })
            .then(body => {
                console.log(body)
                goToStep(3)
            })
    }

    const goToStep = (step: number, e?: React.FormEvent) => {
        e && e.preventDefault()
        setCurrentStep(step)
    }

    if (currentStep === 1) {
        return <div className={styles.container}>
            <Form onBack={() => setCurrentStep(0)}
                logo
                onSubmit={(e) => goToStep(2, e)}
                stepNumber='1' stepsCount='3'
                name='SIGNUP'
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
            </Form>
        </div>
    }

    if (currentStep === 2) {
        return <div className={styles.container}>
            <Form onBack={() => goToStep(1)}
                logo
                onSubmit={handleSubmit}
                stepNumber='2' stepsCount='3'
                name='SIGNUP'
                stepTitle='Create your account' >

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
            <Form onBack={() => goToStep(1)}
                logo
                onSubmit={handleSubmit}
                stepNumber='3' stepsCount='3'
                name='SIGNUP'
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
            logo
            stepTitle='Choose your profile' >
            <div className={styles.profilesContainer}>
                <div className={styles.profile} onClick={() => setCurrentStep(1)}>
                    <div className={styles['profile--title']}>Clients</div>
                    <div className={styles['profile--description']}>
                        I want to hire talent for a project in decentraland.
                    </div>
                </div>

                <a className={styles.profile} href={JOIN_REGISTRY_URL} target="_blank" rel="noreferrer">
                    <div className={styles['profile--title']}>Studio</div>
                    <div className={styles['profile--description']}>
                        I’m a creative working in Decentraland and looking for new projects
                    </div>
                </a>
            </div>
            {/* TODO: fix login url */}
            <div className={styles.text}>Already have an account? <Link href="/login">Log in</Link></div>
        </Form>
    </div>
}