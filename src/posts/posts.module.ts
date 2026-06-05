import { Module } from "@nestjs/common"
import { FeedRankingStrategyFactory } from "@/posts/feed-ranking.strategy"
import { ModerationModule } from "@/moderation/moderation.module"
import { PostsController } from "@/posts/posts.controller"
import { PostsService } from "@/posts/posts.service"
import { PrismaPostsRepository } from "./prisma-posts.repository"
import { I_POST_REPOSITORY } from "./posts.repository"

@Module({
    imports: [ModerationModule],
    controllers: [PostsController],
    providers: [
        PostsService,
        FeedRankingStrategyFactory,
        {
            provide: I_POST_REPOSITORY,
            useClass: PrismaPostsRepository,
        },
    ],
    exports: [PostsService],
})
export class PostsModule {}
