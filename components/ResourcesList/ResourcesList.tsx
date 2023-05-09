import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import styles from './ResourcesList.module.css'
import Empty from '../Icons/Empty'
import LayoutFilteredList from '../LayoutFilteredList/LayoutFilteredList'
import { Filter, FilterGroup } from '../../interfaces/Filters'
import { Resource } from '../../interfaces/Resource'
import ResourceCard from '../ResourceCard/ResourceCard'

const sdk_versions: Filter[] = [
	{
		key: 'sdk_version',
		value: 'SDK7'
	},
	{
		key: 'sdk_version',
		value: 'SDK6'
	}
]

const difficulty_levels = [
	{
		key: 'difficulty_level',
		value: 'Easy'
	},
	{
		key: 'difficulty_level',
		value: 'Intermediate'
	},
	{
		key: 'difficulty_level',
		value: 'Expert'
	}
]

const scene_types = [
	{
		key: 'scene_type',
		value: 'Game mechanic'
	},
	{
		key: 'scene_type',
		value: 'Social mechanic'
	},
	{
		key: 'scene_type',
		value: 'Event venue template'
	}
]
const avilableFilters: FilterGroup[] = [
	{
		title: 'SDK VERSION',
		options: sdk_versions
	},
	{
		title: 'DIFFICULTY LEVEL',
		options: difficulty_levels
	},
	{
		title: 'SCENE TYPE',
		options: scene_types
	},
]

interface Props {
    resources: Resource[]
}

export default function ResourcesList({resources}: Props) {
	const router = useRouter()
	const urlSearchParams = new URLSearchParams(router.asPath.replace('/resources', ''))
	const urlFilters = [...urlSearchParams].map(([keyName, val]) => ({key: keyName, value: val}))

	const [limit, setLimit] = useState(5)
	const [filters, setFilters] = useState<Filter[]>(urlFilters.length ? urlFilters : [{key: 'sdk_version', value: 'SDK7'}])
	
	useEffect(() => {
		router.replace(
			{
			  query: Object.assign({}, ...filters.map(filter => ({[filter.key]: filter.value})) ),
			},
			undefined,
	  		{ shallow: true }
		  )
	}, [filters])


	const filterItem = (resource: any, filter: Filter) => {
		if (filter.key === 'scene_type'){
			return resource['scene_type']?.includes(filter.value)
		}
		return  resource[filter.key] === filter.value
	}

	let filteredList: Resource[] = []

	if (filters.length){
		filteredList = resources.filter(resource => filters.every(filter => filterItem(resource, filter)))
	} else {
		filteredList = resources
	}
	
  const renderResources = filteredList.slice(0, limit)

  const ListPanel = () => <div>
        {renderResources.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}
        {filteredList.length >= limit && <div style={{textAlign: 'center'}}><div onClick={() => setLimit(current => current + 5)} className='button_primary mt-2 center'>LOAD MORE</div></div>}
    </div>

	const EmptyPanel = () => <div className={styles.empty}>
		<Empty />
		<br />
		There are no results for current filters
	</div>

	const HeaderBar = () => <>{filteredList.length} result{filteredList.length > 1 ? 's' : ''}	</>

	return <LayoutFilteredList filters={filters} setFilters={setFilters}
			items={avilableFilters}
			listPanel={<ListPanel />}
			emptyPanel={!resources.length && <EmptyPanel />}
			headerBar={<HeaderBar />} />
}