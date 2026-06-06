import { Body, Controller, Get, Param, Post } from "@nestjs/common"
import { CreateCommentDto } from "@/application/dtos/post.dtos"
import { AddCommentUseCase } from "@/application/use-cases/add-comment.use-case"
import { ListCommentsByPostUseCase } from "@/application/use-cases/list-comments-by-post.use-case"

@Controller("api/posts/:id/comments")
export class CommentsController {
    constructor(
        private readonly listCommentsByPostUseCase: ListCommentsByPostUseCase,
        private readonly addCommentUseCase: AddCommentUseCase,
    ) {}

    @Get()
    list(@Param("id") postId: string) {
        return this.listCommentsByPostUseCase.execute(postId)
    }

    @Post()
    create(@Param("id") postId: string, @Body() body: CreateCommentDto) {
        return this.addCommentUseCase.execute(postId, body)
    }
}
