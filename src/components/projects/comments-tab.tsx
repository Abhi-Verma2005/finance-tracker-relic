'use client'

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { addComment } from "@/actions/comments"
import { useRouter } from "next/navigation"

export function CommentsTab({ projectId, comments, userId, userType }: any) {
    const router = useRouter()
    const [content, setContent] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return

        setLoading(true)
        try {
            await addComment(null, content, projectId)

            setContent("")
            router.refresh()
        } catch (error) {
            console.error('Failed to post comment:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-3">
                <Textarea
                    placeholder="Type your comment..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={3}
                />
                <Button type="submit" disabled={loading || !content.trim()}>
                    {loading ? 'Posting...' : 'Post Comment'}
                </Button>
            </form>

            <div className="space-y-4">
                {comments.length === 0 ? (
                    <Card className="p-8 text-center text-muted-foreground">
                        No comments yet. Start the discussion!
                    </Card>
                ) : (
                    comments.map((comment: any) => (
                        <Card key={comment.id} className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-medium">
                                            {comment.user ? comment.user.name : comment.client?.name}
                                        </span>
                                        {comment.client && (
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                                Client
                                            </span>
                                        )}
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm">{comment.content}</p>

                                    {comment.replies?.length > 0 && (
                                        <div className="mt-4 ml-6 space-y-3 border-l-2 pl-4">
                                            {comment.replies.map((reply: any) => (
                                                <div key={reply.id}>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-medium">
                                                            {reply.user ? reply.user.name : reply.client?.name}
                                                        </span>
                                                        {reply.client && (
                                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                                                Client
                                                            </span>
                                                        )}
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(reply.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{reply.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
