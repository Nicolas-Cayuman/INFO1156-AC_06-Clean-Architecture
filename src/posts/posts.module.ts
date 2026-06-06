import { Module } from "@nestjs/common"
import { FeedRankingStrategyFactory } from "@/posts/feed-ranking.strategy"
import { ModerationModule } from "@/moderation/moderation.module"
import { PostsController } from "@/posts/posts.controller"
import { PrismaPostsRepository } from "./prisma-posts.repository"
import { I_POST_REPOSITORY } from "./posts.repository"
import { CreatePostUseCase } from "@/application/use-cases/create-post.use-case"
import { GetAllPostsUseCase } from "@/application/use-cases/get-all-posts.use-case"
import { GetRankedFeedUseCase } from "@/application/use-cases/get-ranked-feed.use-case"
import { ModerationService } from "@/moderation/moderation.service"

@Module({
    imports: [ModerationModule],
    controllers: [PostsController],
    providers: [
        FeedRankingStrategyFactory,
        {
            provide: I_POST_REPOSITORY,
            useClass: PrismaPostsRepository,
        },
        {
            provide: CreatePostUseCase,
            useFactory: (
                postRepository: PrismaPostsRepository,
                moderationService: ModerationService,
            ) => new CreatePostUseCase(postRepository, moderationService),
            inject: [I_POST_REPOSITORY, ModerationService],
        },
        {
            provide: GetAllPostsUseCase,
            useFactory: (postRepository: PrismaPostsRepository) =>
                new GetAllPostsUseCase(postRepository),
            inject: [I_POST_REPOSITORY],
        },
        {
            provide: GetRankedFeedUseCase,
            useFactory: (
                postRepository: PrismaPostsRepository,
                rankingFactory: FeedRankingStrategyFactory,
            ) => new GetRankedFeedUseCase(postRepository, rankingFactory),
            inject: [I_POST_REPOSITORY, FeedRankingStrategyFactory],
        },
    ],
    exports: [I_POST_REPOSITORY],
})
export class PostsModule {}
