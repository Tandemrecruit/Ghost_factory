import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-6xl">
          Ghost Factory
        </h1>
        <p className="mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Automated landing page generation service. Drop client briefs into the
          watched folder and watch the magic happen.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/clients"
            className="btn-primary"
          >
            View Client Pages
          </Link>
          <Link
            href="https://github.com/Tandemrecruit/Ghost_factory"
            className="btn-outline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </Link>
        </div>
      </div>
    </main>
  )
}
