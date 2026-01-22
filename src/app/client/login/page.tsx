'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { generateMagicLink } from '@/actions/clients'
import { useRouter } from 'next/navigation'

export default function ClientLoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [magicLinkSent, setMagicLinkSent] = useState(false)

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const result = await signIn('credentials', {
            email,
            password,
            callbackUrl: '/client',
            redirect: false,
        })

        if (result?.ok) {
            router.push('/client')
        } else {
            alert('Invalid credentials')
        }
        setLoading(false)
    }

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const result = await generateMagicLink(email)
        if (result.success) {
            setMagicLinkSent(true)
            // In production, email would be sent. For now, show link in console
            console.log('Magic link:', result.magicLink)
        } else {
            alert(result.error || 'Failed to generate magic link')
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Client Portal</CardTitle>
                    <CardDescription>Access your project information</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="credentials" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="credentials">Password</TabsTrigger>
                            <TabsTrigger value="magic">Magic Link</TabsTrigger>
                        </TabsList>

                        <TabsContent value="credentials">
                            <form onSubmit={handleCredentialsLogin} className="space-y-4">
                                <div>
                                    <Input
                                        type="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="magic">
                            {magicLinkSent ? (
                                <div className="text-center py-8">
                                    <p className="text-green-600 font-medium mb-2">Magic link sent!</p>
                                    <p className="text-sm text-muted-foreground">
                                        Check your email for the login link
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleMagicLink} className="space-y-4">
                                    <div>
                                        <Input
                                            type="email"
                                            placeholder="Email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? 'Sending...' : 'Send Magic Link'}
                                    </Button>
                                </form>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
