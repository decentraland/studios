import React, { ChangeEvent } from 'react'

import styles from './Form.module.css'
import BackButton from '../BackButton/BackButton'
import IconInfo from '../Icons/IconInfo'

interface Props {
    children: React.ReactNode
    onBack: () => void
    onSubmit?: (e: React.FormEvent) => void
    stepNumber?: string
    stepsCount?: string
    name?: string
    stepTitle: string
    stepDescription?: string
    logo?: boolean
}


function Form({ children, onBack, onSubmit, stepNumber, stepsCount, name, stepTitle, stepDescription, logo }: Props) {

    const onBackButtonPress = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        onBack()
    }

    return <>
        {logo && <div className={`${styles.logo} ${styles['logo--mobile']}`} />}
        <div className={`${styles.container} ${logo ? styles['container--logo'] : ''}`}>
            <BackButton onClick={onBackButtonPress} />

            <div className={styles.formContainer}>
                {logo && <div className={`${styles.logo}  ${styles['logo--desktop']}`} />}
                <div className={styles.stepsContainer}>
                    {name && <><span>{name}</span>·</>}{stepNumber && <span>STEP {stepNumber} OF {stepsCount}</span>}
                </div>
                <div className={styles.stepTitle}>
                    {stepTitle}
                </div>
                {stepDescription && <div className={styles.description}>
                    {stepDescription}
                </div>}

                <form onSubmit={onSubmit}>
                    {children}
                </form>

            </div>
        </div>
    </>
}

const Label = ({ children }: { children: React.ReactNode }) =>
    <label className={styles.label}>{children}</label>

Form.Label = Label

interface InputProps {
    value?: string
    required: boolean
    placeholder: string
    type?: string
    onChange: (event: ChangeEvent<HTMLInputElement>) => void
}


const InputText = ({ required, value, placeholder, type = "text", onChange }: InputProps) =>
    <input className={styles.input}
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={onChange} />

Form.InputText = InputText

interface SubmitProps {
    value?: string
    disabled: boolean
}

const ButtonSubmit = ({ disabled, value }: SubmitProps) =>
    <input
        className={`${styles.submit_btn} ${disabled ? styles.submit_btn_disabled : ''}`}
        type="submit"
        value={value}
        disabled={disabled}
    />

Form.ButtonSubmit = ButtonSubmit

interface FieldMessage {
    message: string
    icon?: string
    red: boolean
    displayName?: string
}

const FieldMessage = ({ message, icon, red, displayName = 'FieldMessage' }: FieldMessage) => {
    let renderIcon = null
    if (icon === 'info') renderIcon = <IconInfo red={red} />
    // if (icon === 'warning') renderIcon = <IconInfo red={!!color} />

    return <div className={`${styles.credentialsMessage} ${red ? styles['credentialsMessage--red'] : ''}`}>{renderIcon}&nbsp;{message}</div>
}

Form.FieldMessage = FieldMessage

export default Form
