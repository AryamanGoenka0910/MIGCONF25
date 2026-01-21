function PageHeader({ page, title, titleSecondary, subtitle }: { page: string, title: string, titleSecondary: string, subtitle: string }) {
  return (
    <header className="animate-fade-in-up opacity-0">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-4 py-2 text-xs text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            MIG Quant Conference • {page}
        </div>

        <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
        {title} <span className="text-primary">{titleSecondary}</span>
        </h1>

        <p className="mt-4 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
        {subtitle}
        </p>
    </header>
  )
}

export default PageHeader;