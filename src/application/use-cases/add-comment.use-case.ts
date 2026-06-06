import { ModerationService } from "@/moderation/moderation.service"
import { CreateCommentDto } from "@/application/dtos/post.dtos"
import { ICommentRepository } from "@/comments/comments.repository"
import { IPostRepository } from "@/posts/posts.repository"
import {
    BusinessRuleViolationError,
    ResourceNotFoundError,
} from "@/shared/domain-errors"
import { Comment } from "@/comments/comment.entity"

export class AddCommentUseCase {
    constructor(
        private readonly commentRepository: ICommentRepository,
        private readonly postRepository: IPostRepository,
        private readonly moderationService: ModerationService,
    ) {}

    async execute(postId: string, data: CreateCommentDto): Promise<Comment> {
        await this.assertPostExists(postId)

        const moderation = await this.moderationService.moderate(data.content)
        if (!moderation.approved) {
            throw new BusinessRuleViolationError(
                moderation.reason ?? "Comentario bloqueado por moderación",
            )
        }

        return this.commentRepository.create({
            postId,
            content: data.content,
            source: "comments-module",
        })
    }

    private async assertPostExists(postId: string) {
        const post = await this.postRepository.findById(postId)
        if (!post) {
            throw new ResourceNotFoundError("Post no encontrado")
        }
    }
}