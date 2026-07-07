use client'

import { useState } from 'react'
import { ArrowRight, Check, Mail } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { GithubIcon } from '@/components/github-icon'
import { siteConfig } from '@/lib/site'

const topics = ['Beta access', 'Founder Pass', 'Partnership', 'Bug report', 'Press', 'Other']

const fieldClass =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 pt-16">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Talk to Cost AI
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
              Questions, feedback, partnerships, or early access requests.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Form */}
            <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
              {submitted ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <span className="flex size-12 items-center justify-center rounded-full border border-accent/30 bg-accent/10">
                    <Check className="size-6 text-accent" />
                  </span>
                  <h2 className="mt-4 text-lg font-semibold text-foreground">Message sent</h2>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    Thanks for reaching out. We&apos;ll get back to you at the email you provided.
                  </p>
                </div>
              ) : (
                <form action="#" onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Name" htmlFor="name">
                      <input id="name" name="name" required className={fieldClass} placeholder="Ada Lovelace" />
                    </Field>
                    <Field label="Email" htmlFor="email">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className={fieldClass}
                        placeholder="you@company.dev"
                      />
                    </Field>
                  </div>

                  <Field label="Topic" htmlFor="topic">
                    <select id="topic" name="topic" className={fieldClass} defaultValue="">
                      <option value="" disabled>
                        Select a topic
                      </option>
                      {topics.map((topic) => (
                        <option key={topic} value={topic}>
                          {topic}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Message" htmlFor="message">
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      className={fieldClass}
                      placeholder="How can we help?"
                    />
                  </Field>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Send message
                    <ArrowRight className="size-4" />
                  </button>
                </form>
              )}
            </div>

            {/* Contact info */}
            <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
              <a
                href={`mailto:${siteConfig.contactEmail}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30"
              >
                <span className="flex size-9 items-center justify-center rounded-md border border-border bg-secondary">
                  <Mail className="size-4 text-primary" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs text-muted-foreground">Email</span>
                  <span className="block truncate font-mono text-sm text-foreground">
                    {siteConfig.contactEmail}
                  </span>
                </span>
              </a>

              <a
                href={siteConfig.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30"
              >
                <span className="flex size-9 items-center justify-center rounded-md border border-border bg-secondary">
                  <GithubIcon className="size-4 text-primary" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs text-muted-foreground">GitHub</span>
                  <span className="block truncate font-mono text-sm text-foreground">
                    github.com/YOUR_USERNAME/cost-ai
                  </span>
                </span>
              </a>
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  )
}
