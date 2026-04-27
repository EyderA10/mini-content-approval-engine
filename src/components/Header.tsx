import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-20 items-center justify-between px-6 lg:px-8">
        <Link 
          href="/" 
          className="group flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-white shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:shadow-accent/25 group-hover:scale-105">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="h-5 w-5"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl font-semibold tracking-tight text-foreground">
              Approval
            </span>
            <span className="text-xs font-medium uppercase tracking-widest text-foreground-muted">
              Engine
            </span>
          </div>
        </Link>
        
        <nav className="flex items-center gap-6">
          <Link 
            href="/" 
            className="text-sm font-medium text-foreground-muted transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  )
}