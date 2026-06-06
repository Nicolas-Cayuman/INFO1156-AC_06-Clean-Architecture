import { Body, Controller, Get, Post, Query } from "@nestjs/common"

import { CreatePostDto, FeedQueryDto } from "@/application/dtos/post.dtos"
import { CreatePostUseCase } from "@/application/use-cases/create-post.use-case"
import { GetAllPostsUseCase } from "@/application/use-cases/get-all-posts.use-case"
import { GetRankedFeedUseCase } from "@/application/use-cases/get-ranked-feed.use-case"

@Controller("api/posts")
export class PostsController {
    constructor(
        private readonly createPostUseCase: CreatePostUseCase,
        private readonly getAllPostsUseCase: GetAllPostsUseCase,
        private readonly getRankedFeedUseCase: GetRankedFeedUseCase,
    ) {}

    @Post()
    async create(@Body() body: CreatePostDto) {
        const created = await this.createPostUseCase.execute(body)

        return {
            ok: true,
            payload: created,
        }
    }

    @Get()
    async findAll() {
        const posts = await this.getAllPostsUseCase.execute()

        return {
            total: posts.length,
            items: posts,
        }
    }

    @Get("feed")
    async getFeed(@Query() query: FeedQueryDto) {
        const mode = query.mode ?? "latest"
        
        const rankedPosts = await this.getRankedFeedUseCase.execute(
            mode,
            query.categoryId,
        )

        return {
            mode,
            count: rankedPosts.length,
            rows: rankedPosts,
        }
    }
}
