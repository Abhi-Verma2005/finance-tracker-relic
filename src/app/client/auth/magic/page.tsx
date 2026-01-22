import { db } from '@/lib/db'
import { signIn } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function MagicLinkPage({
    searchParams,
}: {
    searchParams: Promise<{ token: string }>
}) {
    const { token } = await searchParams

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Invalid Link</h1>
                    <p className="text-muted-foreground">This magic link is invalid</p>
                </div>
            </div>
        )
    }

    // Verify token
    const client = await db.client.findFirst({
        where: {
            magicToken: token,
            tokenExpiry: { gt: new Date() },
        },
    })

    if (!client) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Link Expired</h1>
                    <p className="text-muted-foreground">This magic link has expired</p>
                </div>
            </div>
        )
    }

    // Clear token after use
    await db.client.update({
        where: { id: client.id },
        data: { magicToken: null, tokenExpiry: null },
    })

    // Sign in the client
    await signIn('credentials', {
        email: client.email,
        redirect: true,
        redirectTo: '/client',
    })

    redirect('/client')
}
