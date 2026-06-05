import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/shared/prisma.service"
import { ILikeRepository, CreateLikeData } from "./likes.repository"
import { Like } from "./like.entity"

@Injectable()
export class PrismaLikesRepository implements ILikeRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: CreateLikeData): Promise<Like> {
        const like = await this.prisma.like.create({
            data,
        })
        return new Like(like)
    }
}
