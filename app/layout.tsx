import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { TRPCProvider } from "@/components/providers/trpc-provider"
import { AuthProvider } from "@/components/providers/session-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Patient Management System",
  description: "A comprehensive patient management system with role-based access control",
  generator: 'Lukas - Full Stack Dev',
  icons: "/fav-icon.png",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <TRPCProvider>
            {children}
            <Toaster />
          </TRPCProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
