import { useRouter } from 'next/router'
import React, { useState, useRef, useEffect } from 'react'

import styles from './SearchInputNav.module.css'
import IconSearch from '../Icons/IconSearch'
import IconX from '../Icons/IconX'

export default function SearchInputNav () {
    const router = useRouter()

    const [ open, setOpen ] = useState(false)
    const [ searchText, setSearchText ] = useState('')

    const inputRef = useRef<HTMLInputElement>(null)

    const handleClearBtn = () => {
        setSearchText('')
        inputRef.current?.focus()
    }

    const handleSubmit = (e: React.KeyboardEvent) => {
        if (e.code === 'Enter'){
            router.push(`/search?q=${searchText}`)
            inputRef.current?.blur()
            // setOpen(false)
            // setSearchText('')
        }
    }

    const handleSearchClick = (e: React.MouseEvent<HTMLOrSVGElement>) => {
        if (searchText && open){
            handleSubmit({ code: 'Enter' } as React.KeyboardEvent)
        } else {
            setOpen(true)
            inputRef.current?.focus()
        }
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setOpen(true)
        inputRef.current?.setSelectionRange(0, inputRef.current?.value.length)
    }

    useEffect(() => {

        const handleRouteChange = (url: string) => {
            if (!url.includes('/search')){
                setOpen(false)
                setSearchText('')
            }
        }
    
        router.events.on('routeChangeStart', handleRouteChange)
    
        return () => {
          router.events.off('routeChangeStart', handleRouteChange)
        }
      }, [router.events])
    
    return <div className={styles.searchContainer}>
        <IconSearch className={styles.searchBtn} onClick={handleSearchClick} />
        <input className={`${styles['searchInput']} ${open ? styles['searchInput--open'] : ''}`} 
            type='text'
            placeholder='Search...'
            ref={inputRef}
            value={searchText}
            onFocus={handleFocus}
            onBlur={() => setOpen(!!searchText)}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyUp={handleSubmit} />
        {searchText && open && <IconX gray className={styles.clearBtn} onClick={handleClearBtn} />}
        {/* {open && <div style={{position: 'absolute'}}>
            <div onClick={() => setSearchText('results')}>results</div>
            <div>option2</div>
        </div>} */}
    </div>
}