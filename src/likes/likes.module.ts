import { Module } from "@nestjs/common"
import { LikesController } from "@/likes/likes.controller"
import { AddLikeUseCase } from "@/application/use-cases/add-like.use-case"
import { PostsModule } from "@/posts/posts.module"
import { PrismaLikesRepository } from "./prisma-likes.repository"
import { I_LIKE_REPOSITORY } from "./likes.repository"
import { I_POST_REPOSITORY } from "@/posts/posts.repository"

@Module({
    imports: [PostsModule],
    controllers: [LikesController],
    providers: [
        {
            provide: I_LIKE_REPOSITORY,
            useClass: PrismaLikesRepository,
        },
        {
            provide: AddLikeUseCase,
            useFactory: (likeRepository: PrismaLikesRepository, postRepository) =>
                new AddLikeUseCase(likeRepository, postRepository),
            inject: [I_LIKE_REPOSITORY, I_POST_REPOSITORY],
        },
    ],
})
export class LikesModule {}
