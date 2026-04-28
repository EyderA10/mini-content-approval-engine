import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Content Approval Engine",
  description: "Get client approvals on video content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-gradient-subtle">
        <main className="flex-1">{children}</main>
        <Toaster 
          position="top-right" 
          richColors
          closeButton
          toastOptions={{
            style: {
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-sans)',
              color: 'var(--foreground)',
            }
          }}
        />
      </body>
    </html>
  );
}