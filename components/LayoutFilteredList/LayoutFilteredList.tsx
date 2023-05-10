import React, { useEffect, useState } from "react"
import { Filter, FilterGroup } from "../../interfaces/Filters"
import IconFilter from "../Icons/IconFilter"
import IconX from "../Icons/IconX"
import { hideIntercom, showIntercom } from "../utils"
import styles from './LayoutFilteredList.module.css'

interface Props {
    items: FilterGroup[]
    headerBar: React.ReactNode
    listPanel: JSX.Element
    headerButton?: React.ReactNode
    filters: Filter[]
    setFilters: React.Dispatch<React.SetStateAction<Filter[]>>
    emptyPanel?: React.ReactNode
}

export default function LayoutFilteredList({ filters, setFilters, items, headerBar, listPanel, headerButton, emptyPanel }: Props) {

    const [showMobileFilters, setShowMobileFilters] = useState(false)

    const Filters = () => {

        const onFilterClick = (item: Filter) => {
            let newFilters = [...filters]
            const filtIndex = newFilters.findIndex(filt => filt.key === item.key && filt.value === item.value)
            if (filtIndex !== -1) {
                newFilters.splice(filtIndex, 1)
            } else {
                newFilters = newFilters.filter(filter => filter.key !== item.key)
                newFilters.push(item)
            }
            setFilters(newFilters)
        }

        return <div className={styles.filtersContainer} style={{ display: showMobileFilters ? 'block' : 'none' }}>
            <div className={styles.filtersMobile_title}>Filter results<IconX onClick={() => setShowMobileFilters(false)} /></div>
            <div className={styles.filtersMobile_container}>
                {items?.map(filterGroup => <div key={`filtGroup-${filterGroup.title}`}>
                <div className={styles.filtersType}>{filterGroup.title}</div>
                {filterGroup.options.map(filter => {
                    const isChecked = filters.findIndex(filt => filt.key === filter.key && filter.value === filt.value) !== -1
                    return <div key={`filt-${filter.value}`} style={isChecked ? filter.style : {}}
                    className={`${styles.tag} ${isChecked ? styles.tag_check : ''}`}
                    onClick={() => onFilterClick(filter)}>
                    {filter.displayValue || filter.value}
                </div>})}
                </ div>)}
            </div>
            <div className={styles.filtersMobile_buttons}>
                <span className='button_basic' onClick={() => setFilters([])}>CLEAR FILTERS</span>
                <span className='button_primary' onClick={() => setShowMobileFilters(false)}>APPLY FILTERS</span>
            </div>
        </div>
    }

    useEffect(() => {
        if (showMobileFilters) {
            hideIntercom()
        } else {
            showIntercom()
        }
    }, [showMobileFilters])

    const openFiltersButton = <IconFilter onClick={() => setShowMobileFilters(true)} />
    return <div className={styles.container}>
        <Filters />
        {emptyPanel ? emptyPanel :
            <div className={styles.listContainer}>
                <div className={styles.titleContainer}>
						<span className={styles.resultsCount}>
                            {headerBar}
							{filters.length ? <span className={styles.clearButton} onClick={() => setFilters([])}><IconX red/> CLEAR FILTERS</span> : null}
                            {headerButton ? <span className={styles.filtersButton}>{openFiltersButton}</span> : null}
                        </span>
                        {headerButton ? headerButton : <span className={styles.filtersButton}>{openFiltersButton}</span>}

                </div>
                {listPanel}
            </div>
        }
        {filters.length ? <div className={styles['clearButton--mobile']} onClick={() => setShowMobileFilters(true)}><IconFilter white />&nbsp;{filters.length} filter{filters.length > 1 ? 's' : ''} active</div> : null}
    </div>

}