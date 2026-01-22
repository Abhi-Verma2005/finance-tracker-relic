export async function GET() {
    return Response.json({
        error: 'Cloudinary upload not configured yet'
    }, { status: 501 })
}

export async function POST(request: Request) {
    // TODO: Implement Cloudinary upload
    // 1. Get file from FormData
    // 2. Upload to Cloudinary using API
    // 3. Return URL

    return Response.json({
        error: 'Cloudinary upload not configured yet'
    }, { status: 501 })
}
