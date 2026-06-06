import { Inject, Injectable } from "@nestjs/common"
import { I_POST_REPOSITORY, IPostRepository } from "@/posts/posts.repository"
import { FeedRankingStrategyFactory } from "@/posts/feed-ranking.strategy"
import { FeedPost } from "@/posts/post.entity"

@Injectable()
export class GetRankedFeedUseCase {
    constructor(
        @Inject(I_POST_REPOSITORY)
        private readonly postRepository: IPostRepository,
        private readonly rankingFactory: FeedRankingStrategyFactory,
    ) {}

    async execute(mode: string, categoryId?: string): Promise<FeedPost[]> {
        const feedPosts = await this.postRepository.getFeedPosts(categoryId)
        const strategy = this.rankingFactory.forMode(mode)
        return strategy.rank(feedPosts)
    }
}