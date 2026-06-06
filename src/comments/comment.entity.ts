export class Comment {
    id!: string
    postId!: string
    content!: string
    source!: string
    createdAt!: Date
    updatedAt!: Date

    constructor(partial: Partial<Comment>) {
        Object.assign(this, partial)
    }

    static fromDatabase(prismaData: any): Comment {
        return new Comment({
            id: prismaData.id,
            postId: prismaData.postId,
            content: prismaData.content,
            source: prismaData.source,
            createdAt: prismaData.createdAt,
            updatedAt: prismaData.updatedAt,
        })
    }
}
