import type { ReactNode } from 'react'
import { Html, Head, Preview, Body, Container, Section, Heading, Hr, Text } from '@react-email/components'

type LayoutProps = {
  /**
   * Short preview text displayed by many email clients.
   */
  previewText?: string
  /**
   * Title shown in the HTML head, sometimes used by clients.
   */
  title?: string
  /**
   * Optional header title shown at the top of the email content.
   */
  headerTitle?: string
  children: ReactNode
}

export function Layout({ children, previewText, title = 'Raison', headerTitle }: LayoutProps) {
  return (
    <Html>
      <Head>
        <title>{title}</title>
      </Head>
      {previewText ? <Preview>{previewText}</Preview> : null}
      <Body style={styles.body}>
        <Container style={styles.container}>
          {headerTitle ? (
            <Section>
              <Heading as="h2" style={styles.heading}>
                {headerTitle}
              </Heading>
              <Hr style={styles.hr} />
            </Section>
          ) : null}
          <Section>{children}</Section>
          <Hr style={styles.hr} />
          <Section>
            <Text style={styles.footer}>You’re receiving this email because you have an account with Raison.</Text>
            <Text style={styles.footer}>© {new Date().getFullYear()} Raison</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: {
    backgroundColor: '#f6f9fc',
    margin: 0,
    padding: 0,
  },
  container: {
    backgroundColor: '#ffffff',
    margin: '24px auto',
    padding: '24px',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '600px',
    border: '1px solid #eaeaea',
  },
  heading: {
    color: '#111827',
    fontSize: '20px',
    margin: 0,
  },
  hr: {
    borderColor: '#eaeaea',
    margin: '16px 0',
  },
  footer: {
    color: '#6b7280',
    fontSize: '12px',
    margin: 0,
  },
} as const
