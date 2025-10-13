import { Resend } from 'resend'

import config from '@/config'

import EmailVerification, { type EmailVerificationProps } from './templates/email-verification'

type TemplatePropsMap = {
  emailVerification: EmailVerificationProps
}

const templates = {
  emailVerification: EmailVerification,
}

type TemplateName = keyof typeof templates

type SendEmailOptions<T extends TemplateName> = {
  to: string | string[]
  subject: string
  template: T
  props: TemplatePropsMap[T]
  from?: string
}

const resend = new Resend(config.RESEND_API_KEY)

export async function sendEmail<T extends TemplateName>(options: SendEmailOptions<T>): Promise<void> {
  if (!config.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not set, email will not be sent')
    return
  }

  const { to, subject, from = 'Raison <no-reply@raison.ist>', template } = options

  const Component = templates[template]
  if (!Component) throw new Error(`Unknown email template: ${template}`)

  await resend.emails.send({ to, from, subject, react: Component(options.props) })
}
