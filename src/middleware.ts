import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized: ({ token }) => {
      if (!token) return false
      return ['admin', 'manager'].includes(token.role as string)
    },
  },
})

export const config = {
  matcher: ['/admin/:path*'],
}