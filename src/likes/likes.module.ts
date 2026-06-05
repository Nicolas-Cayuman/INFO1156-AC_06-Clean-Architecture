import { Module } from "@nestjs/common"
import { LikesController } from "@/likes/likes.controller"
import { LikesService } from "@/likes/likes.service"
import { PostsModule } from "@/posts/posts.module"
import { PrismaLikesRepository } from "./prisma-likes.repository"
import { I_LIKE_REPOSITORY } from "./likes.repository"

@Module({
    imports: [PostsModule],
    controllers: [LikesController],
    providers: [
        LikesService,
        {
            provide: I_LIKE_REPOSITORY,
            useClass: PrismaLikesRepository,
        },
    ],
})
export class LikesModule {}
