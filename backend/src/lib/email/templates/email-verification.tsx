import { Button, Text } from '@react-email/components'
import { Layout } from '../components/layout'

export type EmailVerificationProps = {
  verifyUrl: string
  user: {
    name: string
  }
}

export default function EmailVerification({ verifyUrl, user }: EmailVerificationProps) {
  return (
    <Layout
      title="Verify your email"
      headerTitle="Verify your email"
      previewText="Confirm your email address to finish setting up your Raison account"
    >
      <Text style={styles.paragraph}>Hi {user.name},</Text>
      <Text style={styles.paragraph}>
        Thanks for signing up for Raison. Please confirm your email address by clicking the button below.
      </Text>
      <Button href={verifyUrl} style={styles.button}>
        Verify email
      </Button>
      <Text style={styles.paragraph}>If the button doesn’t work, copy and paste this URL into your browser:</Text>
      <Text style={styles.link}>{verifyUrl}</Text>
    </Layout>
  )
}

const styles = {
  paragraph: {
    color: '#111827',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '0 0 16px 0',
  },
  button: {
    backgroundColor: '#111827',
    borderRadius: '6px',
    color: '#ffffff',
    display: 'inline-block',
    fontSize: '14px',
    padding: '12px 16px',
    textDecoration: 'none',
    marginBottom: '16px',
  },
  link: {
    color: '#2563eb',
    wordBreak: 'break-all' as const,
    fontSize: '12px',
    margin: 0,
  },
} as const
