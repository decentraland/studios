import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import styles from './Search.module.css'
import SearchResultCard from '../SearchResultCard/SearchResultCard'
import Empty from '../Icons/Empty'
import IconX from '../Icons/IconX'
import IconFilter from '../Icons/IconFilter'

const resultTypes = ['resource', 'studio', 'project']

export default function Search() {
	const router = useRouter()
	const query = router.query.searchText as string

	const [results, setResults] = useState(Object.fromEntries(resultTypes.map(item => [item, []])))
	const [loading, setLoading] = useState(false)
	const [filters, setFilters] = useState([] as String[])
	const [showMobileFilters, setShowMobileFilters] = useState(false)

	const Filters = () => {

		const onFilterClick = (item: string) => {
			let newFilters = [...filters]
			const filtIndex = newFilters.indexOf(item)
			if (filtIndex !== -1) {
				newFilters.splice(filtIndex, 1)
			} else {
				newFilters.push(item)
			}
			setFilters(newFilters)
		}

		return <div className={styles.filtersContainer} style={{ display: showMobileFilters ? 'block' : 'none' }}>
			<div className={styles.filtersMobile_title}>Filter results<IconX onClick={() => setShowMobileFilters(false)} /></div>
			<div className={styles.filtersMobile_container}>
				<div className={styles.filtersType}>TYPE</div>
				{resultTypes.map(item => <div key={`filt-${item}`} style={{ cursor: 'pointer' }}
					className={`${styles.tag} ${filters.includes(item) ? styles['tag_' + item + '--active'] : ''}`}
					onClick={() => onFilterClick(item)}>
					{item.toUpperCase()}
				</div>
				)}
			</div>
			<div className={styles.filtersMobile_buttons}>
				<span className='button_basic' onClick={() => setFilters([])}>CLEAR FILTERS</span>
				<span className='button_primary' onClick={() => setShowMobileFilters(false)}>APPLY FILTERS</span>
			</div>
		</div>
	}

	const handleSearch = async (query: string) => {
		setLoading(true)
		const response = await fetch(`/api/search?query=${query}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				query: query
			})
		}).then((res) => res.json())

		console.log(response)
		setResults(response.results)
		setLoading(false)
	}

	useEffect(() => {
		if (query) {
			handleSearch(query)
		}

	}, [query])

	let render: any = {}

	for (const type of resultTypes) {
		if (filters.length) {
			render[type] = filters.includes(type) ? results[type].slice(0, 50) : []
		} else {
			render[type] = results[type].slice(0, 5)
		}
	}

	const resultsCount = resultTypes.map(type => render[type].length).reduce((part, a) => part + a, 0)

	if (loading) return <><Loader active/><h3 className={styles.loading}>Searching...</h3></>

	return <>
		<div className={styles.container}>
			<Filters />
			{resultsCount ? (
				<div className={styles.list_container}>

					<div className={styles.title_container}>
						<span className={styles.results_count}>
							{resultsCount} result{resultsCount > 1 ? 's' : ''} for <b>{query}</b>
							{filters.length ? <span className={styles.clearButton} onClick={() => setFilters([])}><IconX red/> CLEAR FILTERS</span> : null}
						</span>
						<span className={styles.filtersButton}><IconFilter onClick={() => setShowMobileFilters(true)} /></span>
					</div>
					{resultTypes.map(type => render[type].length ? <div key={`result-${type}`}>
						<div className={`${styles.tag} ${styles[`tag_${type}--active`]}`}>{type.toUpperCase()}</div>
						{render[type].map((result: any) => <div key={`${result.type}${result.id}`}>
							<SearchResultCard data={result} query={query} />
						</div>)}
						{results[type].length > render[type].length && !filters.length && <div className='button_primary--inverted mb-4' onClick={() => setFilters([type])}>SHOW ALL {type.toUpperCase()} RESULTS</div>}
					</div> 
					: null)}
							{filters.length ? <div className={styles['clearButton--mobile']} onClick={() => setShowMobileFilters(true)}><IconFilter white />&nbsp;{filters.length} filter{filters.length > 1 ? 's' : ''} active</div> : null}
				</div>
			) : (
				<div className={styles.empty}>
					<Empty />
					<br />
					There are no results for <b>{query}</b>
				</div>

			)}
		</div>
	</>
}