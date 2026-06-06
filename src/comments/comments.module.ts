import { Module } from "@nestjs/common"
import { CommentsController } from "@/comments/comments.controller"
import { AddCommentUseCase } from "@/application/use-cases/add-comment.use-case"
import { ListCommentsByPostUseCase } from "@/application/use-cases/list-comments-by-post.use-case"
import { ModerationModule } from "@/moderation/moderation.module"
import { PostsModule } from "@/posts/posts.module"
import { PrismaCommentsRepository } from "./prisma-comments.repository"
import { I_COMMENT_REPOSITORY } from "./comments.repository"
import { I_POST_REPOSITORY } from "@/posts/posts.repository"
import { ModerationService } from "@/moderation/moderation.service"

@Module({
    imports: [PostsModule, ModerationModule],
    controllers: [CommentsController],
    providers: [
        {
            provide: I_COMMENT_REPOSITORY,
            useClass: PrismaCommentsRepository,
        },
        {
            provide: ListCommentsByPostUseCase,
            useFactory: (commentRepository: PrismaCommentsRepository, postRepository) =>
                new ListCommentsByPostUseCase(commentRepository, postRepository),
            inject: [I_COMMENT_REPOSITORY, I_POST_REPOSITORY],
        },
        {
            provide: AddCommentUseCase,
            useFactory: (
                commentRepository: PrismaCommentsRepository,
                postRepository,
                moderationService: ModerationService,
            ) => new AddCommentUseCase(commentRepository, postRepository, moderationService),
            inject: [I_COMMENT_REPOSITORY, I_POST_REPOSITORY, ModerationService],
        },
    ],
})
export class CommentsModule {}
