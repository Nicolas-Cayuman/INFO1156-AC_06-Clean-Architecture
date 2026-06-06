export class Post {
    id!: string
    title!: string
    description!: string
    imageUrl!: string
    categoryId!: string | null
    createdAt!: Date
    updatedAt!: Date

    constructor(data: Partial<Post>) {
        Object.assign(this, data)
    }

    static fromDatabase(prismaData: any): Post {
        return new Post({
            id: prismaData.id,
            title: prismaData.title,
            description: prismaData.description,
            imageUrl: prismaData.imageUrl,
            categoryId: prismaData.categoryId,
            createdAt: prismaData.createdAt,
            updatedAt: prismaData.updatedAt,
        })
    }
}

export class FeedPost extends Post {
    categoryName!: string | null
    likesCount!: number
    commentsCount!: number

    get relevanceScore(): number {
        // Lógica de negocio encapsulada en la entidad: 
        // 2 puntos por like, 3 puntos por comentario
        return (this.likesCount * 2) + (this.commentsCount * 3)
    }

    static fromDatabase(prismaData: any): FeedPost {
        const post = new FeedPost({
            id: prismaData.id,
            title: prismaData.title,
            description: prismaData.description,
            imageUrl: prismaData.imageUrl,
            categoryId: prismaData.categoryId,
            createdAt: prismaData.createdAt,
            updatedAt: prismaData.updatedAt,
        })
        post.categoryName = prismaData.category?.name ?? null
        post.likesCount = prismaData.likes?.reduce((sum: number, l: any) => sum + l.weight, 0) ?? 0
        post.commentsCount = prismaData.comments?.length ?? 0
        return post
    }
}
