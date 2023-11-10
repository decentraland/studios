import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import styles from './Search.module.css'
import SearchResultCard from '../SearchResultCard/SearchResultCard'
import Empty from '../Icons/Empty'
import LayoutFilteredList from '../LayoutFilteredList/LayoutFilteredList'
import { Filter, FilterGroup } from '../../interfaces/Filters'
import { SearchResult } from '../../interfaces/SearchResult'

const listGroups: Filter[] = [
	{
		key: 'type',
		value: 'resource',
		displayValue: 'RESOURCE',
		style: {
			color: '#5688E7',
			background: '#E3ECFA',
			border: '1px solid #E3ECFA',
		}
	},
	{
		key: 'type',
		value: 'studio',
		displayValue: 'STUDIO',
		style: {
			color: '#C72B32',
			background: '#F6DFE3',
			border: '1px solid #F6DFE3'
		}
	},
	{
		key: 'type',
		value: 'project',
		displayValue: 'PROJECT',
		style: {
			color: '#382AAC',
			background: '#EEEDF8',
			border: '1px solid #EEEDF8'
		}
	}
]
const avilableFilters: FilterGroup[] = [
	{
		title: 'TYPE',
		options: listGroups
	}
]

export default function Search() {
	const router = useRouter()
	const query = router.query.q as string

	const [results, setResults] = useState([] as SearchResult[])
	const [loading, setLoading] = useState(false)
	const [filters, setFilters] = useState([] as Filter[])

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
		setResults(response.results)
		setLoading(false)
	}

	useEffect(() => {
		if (query) {
			handleSearch(query)
		}

	}, [query])


	const filterElements = (items: SearchResult[], filter: Filter) => {
		return items.filter((item: any) => item[filter.key] === filter.value)
	}

	let filteredList: SearchResult[] = []

	if (filters.length) {
		filters.forEach(filter => filteredList = filteredList.concat(filterElements(results, filter)))
	} else {
		filteredList = results
	}

	const GroupedList = () => {
		const renderGroups = listGroups.filter(group => filteredList.some((item: any) => item[group.key] === group.value))

		if (!renderGroups.length) {
			return <EmptyPanel message="There are no results for the selected filter" />
		}

		return <>{renderGroups.map(group => {
			const groupItems = filterElements(filteredList, group)
			return <div key={`result-${group.value}`}>
				<div className={`${styles.tag} ${styles[`tag_${group.value}--active`]}`}>{group.value.toUpperCase()}</div>
				{groupItems.slice(0, 5).map(result => <div key={`${result.type}${result.id}`}>
					<SearchResultCard data={result} query={query} />
				</div>)}
				{groupItems.length > 5 && !filters.length && <div className='button_primary--inverted mb-4' onClick={() => setFilters([group])}>SHOW ALL {group.value.toUpperCase()} RESULTS</div>}
			</div>
		})}</>
	}

	const EmptyPanel = ({ message }: { message?: string }) => <div className={styles.empty}>
		<Empty />
		<br />
		{message ? message : <span>There are no results for <b>{query}</b></span>}
	</div>

	const HeaderBar = () => <>{filteredList.length} result{filteredList.length > 1 ? 's' : ''} for <b>{query}</b></>

	if (loading) return <><Loader active>Searching...</Loader></>

	return <div className={styles.container}>
		<LayoutFilteredList activeFilters={filters} setActiveFilters={setFilters}
			filtersList={avilableFilters}
			listPanel={results.length ? <GroupedList /> : <EmptyPanel />}
			headerBar={<HeaderBar />} />
	</div>
}