import { budgetToRanges } from '../components/utils'
import { createVerificationToken, isBoundedString, pick } from './security'

const SENDRGRID_URL = process.env.NEXT_PUBLIC_API_SENDGRID
const SENDGRID_ACCESS_TOKEN = process.env.SENDGRID_ACCESS_TOKEN
const VERIFY_JOB_TEMPLATE_ID = 'd-0dd32315fc5241c89e78783713c66934'

const JOB_FIELDS = ['title', 'budget', 'short_description', 'long_description', 'deadline_date', 'landing_url'] as const

/**
 * Returns the fields a client can set on a new job, or undefined when any of them is invalid.
 */
export function parseJobInput(rawJob: unknown) {
  const job = pick(rawJob && typeof rawJob === 'object' ? rawJob : {}, JOB_FIELDS)

  if (
    !isBoundedString(job.title, 256) || !job.title ||
    !isBoundedString(job.budget, 64) || !job.budget ||
    !isBoundedString(job.long_description, 10000) || !job.long_description ||
    !Array.isArray(job.short_description) || job.short_description.length > 10 || !job.short_description.every(item => isBoundedString(item, 256)) ||
    (job.deadline_date !== undefined && job.deadline_date !== null && job.deadline_date !== '' && !isBoundedString(job.deadline_date, 64)) ||
    (job.landing_url !== undefined && job.landing_url !== null && !isBoundedString(job.landing_url, 2048))
  ) {
    return undefined
  }

  return job
}

interface UnverifiedJob {
  id: string
  email: string
  author_name: string
  title: string
  budget: string
}

type VerificationEmailOptions = { mode: 'guest', firstName?: string } | { mode: 'full' }

/**
 * Sends the email with the link that verifies (publishes) a new job. Resolves whether SendGrid accepted it.
 * In `guest` mode the job was written by someone who only had to know the email address, so the email carries just the
 * title, the budget range, the author's first name and the link: no free text that could be used to phish the owner of
 * that address. `full` mode passes the whole job to the template.
 */
export async function sendJobVerificationEmail(job: UnverifiedJob, options: VerificationEmailOptions = { mode: 'full' }) {
  const verify_url = `https://studios.decentraland.org/jobs/verify?id=${job.id}#token=${await createVerificationToken('job', job.id)}`

  const dynamic_template_data = options.mode === 'guest'
    ? {
      title: job.title,
      budget: budgetToRanges(job.budget),
      first_name: options.firstName,
      verify_url,
    }
    : {
      ...job,
      budget: budgetToRanges(job.budget),
      verify_url,
    }

  const res = await fetch(`${SENDRGRID_URL}/mail/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SENDGRID_ACCESS_TOKEN}`
    },
    body: JSON.stringify({
      from: {
        email: "studios@decentraland.org", name: "Decentraland Studios"
      },
      personalizations: [{
        to: [
          { email: job.email, name: options.mode === 'guest' ? options.firstName : job.author_name }
        ],
        dynamic_template_data
      }],
      template_id: VERIFY_JOB_TEMPLATE_ID
    })
  })
  await res.body?.cancel()

  return res.ok
}
