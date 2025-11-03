import * as React from "react"

// Minimal placeholder dialog primitives so imports resolve.
// These are intentionally lightweight wrappers that simply render
// the provided children. They avoid introducing new runtime
// dependencies while keeping the UI structure used by callers.

export function Dialog({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function DialogTrigger({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function DialogContent({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-dialog-content
      className="bg-background border rounded-md p-4 shadow-md max-w-lg mx-auto"
    >
      {children}
    </div>
  )
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-2">{children}</div>
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold">{children}</h3>
}

export function DialogDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>
}

export default Dialog
