import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans, Geist } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

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
      className={cn("h-full", "antialiased", cormorant.variable, "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-gradient-subtle">
        <Header />
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