import { Body, Controller, Param, Post } from "@nestjs/common"
import { AddLikeDto } from "@/application/dtos/post.dtos"
import { AddLikeUseCase } from "@/application/use-cases/add-like.use-case"

@Controller("api/posts/:id/likes")
export class LikesController {
    constructor(private readonly addLikeUseCase: AddLikeUseCase) {}

    @Post()
    create(@Param("id") postId: string, @Body() body: AddLikeDto) {
        return this.addLikeUseCase.execute(postId, body)
    }
}
