import { PartnerProject } from '../interfaces/PartnerProject'

const PROJECTS_URL = `${process.env.NEXT_PUBLIC_PARTNERS_DATA_URL}/items/projects`

export default class Projects {
  static Url = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL || ''

  static async get({basicData, ideas}: {basicData?: boolean, ideas?: boolean}) {
    let isFinished = false
    let offset = 0
    const queryFields = basicData && !ideas ? '&sort[]=-date_created&fields=image_1,id,title,profile' : ''
    const queryIdeas = ideas ? '&filter[profile]=358' : '&filter[profile][_neq]=358'
    
    const projects: PartnerProject[] = []
    while (!isFinished) {
      try {
        const response = await fetch(`${PROJECTS_URL}?offset=${offset}${queryIdeas}${queryFields}`)
        const data = (await response.json()).data as PartnerProject[]
        if (data.length === 0) {
          isFinished = true
        } else {
          offset += data.length
        }
        projects.push(...data)
      } catch (error) {
        console.log('error', error)
      }
    }

    return projects
  }

  static async getProject(searchParams: string) {
    let projects: PartnerProject[] = []

    try {
      const response = await fetch(`${PROJECTS_URL}${searchParams}`)
      projects = (await response.json()).data as PartnerProject[]
    } catch (error) {
      console.log('error getting project', error)
    }

    return projects
  }

  static async getIdsAndProfiles() {
    const projects = await this.get({})

    return projects.map((project) => {
      return {
        params: {
          id: project.id.toString(),
          profile: project.profile.toString(),
        },
      }
    })
  }
}
