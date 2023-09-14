import React, { useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'

import styles from './ProjectsList.module.css'
import { PartnerProject } from '../../interfaces/PartnerProject'
import { Filter, FilterGroup } from '../../interfaces/Filters'
import ProjectCard from '../ProjectCard/ProjectCard'
import LayoutFilteredList from '../LayoutFilteredList/LayoutFilteredList'

const services: Filter[] = [
  {
    key: 'service_tags',
    value: '3D Modeling'
  },
  {
    key: 'service_tags',
    value: 'Advertisement'
  },
  {
    key: 'service_tags',
    value: 'Creative Director'
  },
  {
    key: 'service_tags',
    value: 'Emote Design'
  },
  {
    key: 'service_tags',
    value: 'Entertainment'
  },
  {
    key: 'service_tags',
    value: 'Land Rental'
  },
  {
    key: 'service_tags',
    value: 'Linked Wearables'
  },
  {
    key: 'service_tags',
    value: 'Programming'
  },
  {
    key: 'service_tags',
    value: 'Venue Rental'
  },
  {
    key: 'service_tags',
    value: 'Wearable Design'
  }
]

const avilableFilters: FilterGroup[] = [
	{
		title: 'SERVICES',
		options: services
	}
]

const filterItem = (project: any, filter: Filter) => {
  if (['service_tags'].includes(filter.key)){
    return (project[filter.key] || []).includes(filter.value)
  }
  return  project[filter.key] === filter.value
}

const Empty = dynamic(() => import('../Icons/Empty'), {
  ssr: false,
})

function ProjectsList({ projects }: { projects: PartnerProject[] }) {
  
  const router = useRouter()
	const urlSearchParams = new URLSearchParams(router.asPath.replace('/projects', ''))	
  const urlFilters = [...urlSearchParams].map(([keyName, val]) => ({key: keyName, value: val}))
  
  const [projectsList, setProjectsList] = useState<PartnerProject[]>(projects)
  const [filters, setFilters] = useState<Filter[]>(urlFilters.length ? urlFilters : [])
  const [limit, setLimit] = useState(parseInt(globalThis?.sessionStorage?.projectsListLimit) || 18)
  const [filteredList, setFilteredList] = useState(projectsList)

  useEffect(() => {
    fetch('/api/get/projects')
      .then(res => res.ok && res.json())
      .then((data) => setProjectsList(data))
      .catch((err) => console.log(err))
  }, [])

  useEffect(() => {
    filterProjects()
  }, [filters, projectsList])
  
  const filterProjects = () => {
    let newList = projectsList.filter(project => filters.every(filter => filterItem(project, filter)))
    setFilteredList(newList)
  }
  
  const renderProjects = filteredList.slice(0, limit)

  useEffect(() => {
    let newQuery: any = {}
    filters.forEach(filter => newQuery[filter.key] = [ ...(newQuery[filter.key] || []), filter.value])
		
    router.replace(
			{
			  query: newQuery
			},
			undefined,
	  		{ shallow: true }
		  )
	}, [filters])

  useEffect(() => {
    globalThis.sessionStorage.setItem('projectsListLimit', limit.toString());
  }, [limit])

  const headerBar = <>{filteredList.length} project{filteredList.length !== 1 ? 's' : ''}</>

  const emptyPanel = <div className={styles.empty}>
    <Empty />
    <br />
    <FormattedMessage id="filter.noResults" />
  </div>

  const listPanel = <>
    <div className={styles.projects_grid}>
        {renderProjects.map((project) => <ProjectCard key={project.id} project={project} />)}
    </div>
    {filteredList.length >= limit && <div className={styles.load_more_container}><div className={'button_primary'} onClick={() => setLimit(current => current + 12)}>LOAD MORE</div></div>}
  </>

  return(
      <LayoutFilteredList activeFilters={filters} setActiveFilters={setFilters}
        filtersList={avilableFilters}
        headerBar={headerBar}
        listPanel={renderProjects.length ? listPanel : emptyPanel}
      />
  )

}

export default ProjectsList