import { User } from "./User"
import { VerifiedPartner } from "./VerifiedPartner"

export interface Conversation {
  id: string
  messages: Message[]
  title: string
  participants: string[]
  date_created: string
  related_job?: string
  new_messages: boolean
  studio_data?: VerifiedPartner
  user_created: User
}

export interface UIConversation extends Conversation{
  last_read_message: string
}



export interface Message {
  id: string
  author: User
  conversation: string
  parsed_email: {}
  message: string
  date_created: string
  attachments?: { directus_files_id: {filename_download: string, id: string} }[]
  read_by: User[]
}
