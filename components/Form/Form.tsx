import React, { ChangeEvent } from 'react'

import styles from './Form.module.css'
import BackButton from '../BackButton/BackButton'
import IconInfo from '../Icons/IconInfo'

interface Props {
    children: React.ReactNode
    onBack?: () => void
    onSubmit?: (e: React.FormEvent) => void
    onInvalid?: (e: React.FormEvent) => void
    stepNumber?: string | number
    stepsCount?: string | number
    name?: string
    stepTitle: string
    stepDescription?: string
    logo?: boolean
    showBackButton?: boolean
}


function Form({ children, showBackButton, onBack, onSubmit, onInvalid, stepNumber, stepsCount, name, stepTitle, stepDescription, logo }: Props) {

    const onBackButtonPress = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        onBack && onBack()
    }

    return <>
        {logo && <div className={`${styles.logo} ${styles['logo--mobile']}`} />}
        <div className={`${styles.container} ${logo ? styles['container--logo'] : ''}`}>
            {onBack && <BackButton  onClick={onBackButtonPress} />}
            {showBackButton && <BackButton />}

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

                <form onSubmit={onSubmit} onInvalid={onInvalid}>
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
    id?: string
    value?: string
    required?: boolean
    invalid?: boolean
    placeholder: string
    type?: string
    onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

const InputText = ({ id, required, invalid, value, placeholder, type = "text", onChange }: InputProps) =>
    <input className={`${styles.input} ${invalid ? styles['input--invalid'] : ''}}`}
        id={id}
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={onChange} />

Form.InputText = InputText

interface SubmitProps {
    value?: string
    disabled: boolean
    inverted?: boolean
    onClick?: () => void
}

const ButtonSubmit = ({ disabled, value, inverted, onClick }: SubmitProps) =>
    <input
        className={`${styles.submit_btn} ${inverted ? styles['submit_btn--inverted'] : ''} ${disabled ? styles.submit_btn_disabled : ''}`}
        type="submit"
        value={value}
        disabled={disabled}
        onClick={() => onClick && onClick()}
    />

Form.ButtonSubmit = ButtonSubmit

interface FieldMessage {
    message: string
    icon?: string
    red?: boolean
    displayName?: string
}

const FieldMessage = ({ message, icon, red, displayName = "FieldMessage" }: FieldMessage) => {
    let renderIcon = null
    if (icon === 'info') renderIcon = <IconInfo red={red} />
    // if (icon === 'warning') renderIcon = <IconInfo red={!!color} />

    return <div className={`${styles.credentialsMessage} ${red ? styles['credentialsMessage--red'] : ''}`}>{renderIcon}&nbsp;{message}</div>
}

Form.FieldMessage = FieldMessage

const Text = ({ children }: {children: React.ReactNode}) => {
    return <div className={styles.text}>{children}</div>
}

Form.Text = Text

export default Form
