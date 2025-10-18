"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                Hackathon Template
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                href="/profile"
                className="text-gray-700 hover:text-gray-900 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium"
              >
                Profile
              </Link>
              <Link
                href="/settings"
                className="text-gray-700 hover:text-gray-900 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium"
              >
                Settings
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="px-2 sm:px-4 py-4 sm:py-6">
          <div className="border-4 border-dashed border-gray-200 rounded-lg min-h-96 p-4 sm:p-6 lg:p-8">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                Welcome to your Dashboard!
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto">
                Hello, {session.user?.name}! This is your dashboard where you can build your hackathon project.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mt-6 sm:mt-8">
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    Quick Start
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Start building your hackathon project with this template.
                  </p>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    Features
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Google OAuth, Prisma DB, Tailwind CSS all set up.
                  </p>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow sm:col-span-2 lg:col-span-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    Ready to Code
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Everything is configured and ready for development.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
