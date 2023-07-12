import { PartnerProject } from '../interfaces/PartnerProject'

const PROJECTS_URL = `${process.env.NEXT_PUBLIC_PARTNERS_DATA_URL}/items/projects`

export default class Projects {

  static Url = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL || ''
  
  static async get() {
    let isFinished = false
    let offset = 0
    const queryFields = '&sort[]=-date_created&fields=date_created,image_1,id,title,profile.name,profile.slug,profile.logo'
    
    let projects: PartnerProject[] = []
    while (!isFinished) {
      try {
        const response = await fetch(`${PROJECTS_URL}?offset=${offset}${queryFields}`)
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

    projects = projects.filter(project => project.profile)

    return projects
  }

  static async getProject(id: string) {
    let projects

    const queryFields = `?filter[id]=${id}&fields=*,profile.name,profile.slug,profile.logo`
    try {
      const response = await fetch(`${PROJECTS_URL}${queryFields}`)
      projects = (await response.json()).data[0] as PartnerProject
    } catch (error) {
      console.log('error getting project', error)
    }

    return projects
  }

  static async getAllIds() {
    const projects = await this.get()

    return projects.map((project) => {
      return {
        params: {
          id: `${project.id}`
        },
      }
    })
  }
}
