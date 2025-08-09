import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/lib/redux-provider";
import { Toaster } from "sonner"
// import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange> */}
          <Providers>
            <div className="min-h-screen bg-background">{children}</div>
            <Toaster position="top-right" richColors closeButton />
          </Providers>
        {/* </ThemeProvider> */}
      </body>
    </html>
  )
}
