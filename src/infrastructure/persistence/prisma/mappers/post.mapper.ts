import { Post as PrismaPost } from "@prisma/client"
import { FeedPost, Post } from "../../../../domain/entities/post.entity"

export class PostMapper {
    /**
     * Convierte un modelo de Prisma a una Entidad de Dominio pura.
     */
    static toDomain(raw: PrismaPost): Post {
        return new Post({
            id: raw.id,
            title: raw.title,
            description: raw.description,
            imageUrl: raw.imageUrl,
            categoryId: raw.categoryId,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        })
    }

    /**
     * Convierte un modelo de Prisma (con sus relaciones incluidas)
     * a una Entidad de Dominio FeedPost.
     */
    static toFeedDomain(raw: any): FeedPost {
        const likesCount = raw.likes
            ? raw.likes.reduce((sum: number, l: any) => sum + l.weight, 0)
            : 0
        const commentsCount = raw.comments ? raw.comments.length : 0
        const categoryName = raw.category ? raw.category.name : null

        return new Post({
            id: raw.id,
            title: raw.title,
            description: raw.description,
            imageUrl: raw.imageUrl,
            categoryId: raw.categoryId,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
            categoryName,
            likesCount,
            commentsCount,
            relevanceScore: 0,
        }) as FeedPost
    }

    /**
     * Extrae los datos de la Entidad de Dominio para guardarlos en Prisma.
     */
    static toPersistence(post: Post) {
        return {
            id: post.id,
            title: post.title,
            description: post.description,
            imageUrl: post.imageUrl,
            categoryId: post.categoryId,
            // createdAt y updatedAt son manejados típicamente por Prisma
        }
    }
}
