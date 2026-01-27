export default function Loading() {
    return (
        <div className="space-y-6 max-w-3xl mx-auto animate-pulse">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="border-l-2 border-border/50 ml-4 space-y-8 pb-10">
                <div className="pl-8 space-y-4">
                    <div className="h-6 w-32 bg-muted rounded" />
                    <div className="h-32 w-full bg-muted rounded-xl" />
                    <div className="h-32 w-full bg-muted rounded-xl" />
                </div>
            </div>
        </div>
    )
}
