import Link from "next/link";
import { Home } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-between p-8 lg:p-12">
        <Link href="/" className="flex items-center gap-2 text-navy-900">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-navy-900 text-white">
            <Home className="h-4 w-4" />
          </div>
          <span className="font-display text-lg font-semibold">EstateAI</span>
        </Link>

        <div className="mx-auto w-full max-w-sm py-16">
          <h1 className="font-display text-2xl font-semibold text-navy-900">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>

        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} EstateAI. All rights reserved.
        </p>
      </div>

      <div className="relative hidden overflow-hidden bg-navy-950 lg:block">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(34,58,107,0.6), transparent 40%), radial-gradient(circle at 80% 70%, rgba(196,67,43,0.25), transparent 45%)",
          }}
        />
        <div className="relative z-10 flex h-full flex-col justify-end p-12">
          <div className="max-w-md rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <p className="font-mono text-xs uppercase tracking-widest text-white/50">
              Lead score 94/100 · Hot
            </p>
            <p className="mt-3 font-display text-lg text-white">
              &ldquo;Sarah is a high-intent buyer looking for a 3-bedroom home around
              Parramatta, pre-approved, wants to inspect Saturday.&rdquo;
            </p>
            <p className="mt-3 text-sm text-white/60">
              Generated automatically from an 11:47&nbsp;PM website enquiry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
