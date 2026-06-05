import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/shared/prisma.service"
import { IPostRepository } from "./posts.repository"
import { FeedPost, Post } from "./post.entity"
import { CreatePostDto } from "./posts.dtos"

@Injectable()
export class PrismaPostsRepository implements IPostRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: CreatePostDto): Promise<Post> {
        const created = await this.prisma.post.create({ data })
        return new Post(created)
    }

    async findAll(): Promise<Post[]> {
        const posts = await this.prisma.post.findMany({
            orderBy: { createdAt: "desc" },
        })
        return posts.map((p) => new Post(p))
    }

    async findById(id: string): Promise<Post | null> {
        const post = await this.prisma.post.findUnique({ where: { id } })
        if (!post) return null
        return new Post(post)
    }

    async getFeedPosts(categoryId?: string): Promise<FeedPost[]> {
        const posts = await this.prisma.post.findMany({
            where: categoryId ? { categoryId } : undefined,
            include: { comments: true, likes: true, category: true },
        })

        return posts.map(
            (post) =>
                new Post({
                    ...post,
                    categoryName: post.category?.name ?? null,
                    likesCount: post.likes.reduce(
                        (sum, l) => sum + l.weight,
                        0,
                    ),
                    commentsCount: post.comments.length,
                    relevanceScore: 0,
                }) as FeedPost,
        )
    }
}
