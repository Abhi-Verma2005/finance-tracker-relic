import { Document, User } from "@prisma/client"

export type ExtendedDocument = Document & {
    uploadedBy: User
}
