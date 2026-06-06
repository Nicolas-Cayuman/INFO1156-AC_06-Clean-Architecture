import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/shared/prisma.service"
import { IPostRepository } from "@/domain/repositories/post-repository.interface"
import { FeedPost, Post } from "@/domain/entities/post.entity"
import { PostMapper } from "./mappers/post.mapper"

@Injectable()
export class PrismaPostRepository implements IPostRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(post: Post): Promise<Post> {
        const persistenceModel = PostMapper.toPersistence(post)
        
        const created = await this.prisma.post.create({
            data: persistenceModel,
        })
        
        return PostMapper.toDomain(created)
    }

    async findAll(): Promise<Post[]> {
        const posts = await this.prisma.post.findMany({
            orderBy: { createdAt: "desc" },
        })
        
        return posts.map(PostMapper.toDomain)
    }

    async findById(id: string): Promise<Post | null> {
        const post = await this.prisma.post.findUnique({ where: { id } })
        
        if (!post) return null
        
        return PostMapper.toDomain(post)
    }

    async getFeedPosts(categoryId?: string): Promise<FeedPost[]> {
        const posts = await this.prisma.post.findMany({
            where: categoryId ? { categoryId } : undefined,
            include: { comments: true, likes: true, category: true },
        })

        return posts.map(PostMapper.toFeedDomain)
    }
}
