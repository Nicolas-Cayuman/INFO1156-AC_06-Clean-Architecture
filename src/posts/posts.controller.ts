import { Body, Controller, Get, Post, Query } from "@nestjs/common"

import { PostsService } from "@/posts/posts.service"
import { GetRankedFeedUseCase } from "@/posts/get-ranked-feed.use-case"
import { CreatePostDto, FeedQueryDto } from "@/posts/posts.dtos"

@Controller("api/posts")
export class PostsController {
    constructor(
        private readonly postsService: PostsService,
        private readonly getRankedFeedUseCase: GetRankedFeedUseCase,
    ) {}

    @Post()
    async create(@Body() body: CreatePostDto) {
        const created = await this.postsService.create(body)

        return {
            ok: true,
            payload: created,
        }
    }

    @Get()
    async findAll() {
        const posts = await this.postsService.findAll()

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
