import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/shared/prisma.service"
import { ICommentRepository, CreateCommentData } from "./comments.repository"
import { Comment } from "./comment.entity"

@Injectable()
export class PrismaCommentsRepository implements ICommentRepository {
    constructor(private readonly prisma: PrismaService) {}

    async listByPostId(postId: string): Promise<Comment[]> {
        const comments = await this.prisma.comment.findMany({
            where: { postId },
            orderBy: { createdAt: "desc" },
        })
        return comments.map((c) => new Comment(c))
    }

    async create(data: CreateCommentData): Promise<Comment> {
        const comment = await this.prisma.comment.create({
            data,
        })
        return new Comment(comment)
    }
}
