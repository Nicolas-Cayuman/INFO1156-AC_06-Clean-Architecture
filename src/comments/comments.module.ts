import { Module } from "@nestjs/common"
import { CommentsController } from "@/comments/comments.controller"
import { CommentsService } from "@/comments/comments.service"
import { ModerationModule } from "@/moderation/moderation.module"
import { PostsModule } from "@/posts/posts.module"
import { PrismaCommentsRepository } from "./prisma-comments.repository"
import { I_COMMENT_REPOSITORY } from "./comments.repository"

@Module({
    imports: [PostsModule, ModerationModule],
    controllers: [CommentsController],
    providers: [
        CommentsService,
        {
            provide: I_COMMENT_REPOSITORY,
            useClass: PrismaCommentsRepository,
        },
    ],
})
export class CommentsModule {}
