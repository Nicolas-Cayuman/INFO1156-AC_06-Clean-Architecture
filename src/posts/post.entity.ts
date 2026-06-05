export class Post {
    id!: string
    title!: string
    description!: string
    imageUrl!: string
    categoryId!: string | null
    createdAt!: Date
    updatedAt!: Date

    // Agregados opcionales (para el Feed)
    categoryName?: string | null
    likesCount?: number
    commentsCount?: number
    relevanceScore?: number

    constructor(data: Partial<Post>) {
        Object.assign(this, data)
    }
}

export type FeedPost = Post & {
    categoryName: string | null
    likesCount: number
    commentsCount: number
    relevanceScore: number
}
