import { Inject, Injectable } from "@nestjs/common"
import { CreateCommentDto } from "@/posts/posts.dtos"
import { ModerationService } from "@/moderation/moderation.service"
import { PostsService } from "@/posts/posts.service"
import {
    BusinessRuleViolationError,
    ResourceNotFoundError,
} from "@/shared/domain-errors"
import { I_COMMENT_REPOSITORY, ICommentRepository } from "./comments.repository"

@Injectable()
export class CommentsService {
    constructor(
        @Inject(I_COMMENT_REPOSITORY)
        private readonly commentRepository: ICommentRepository,
        private readonly postsService: PostsService,
        private readonly moderationService: ModerationService,
    ) {}

    async listByPostId(postId: string) {
        await this.assertPostExists(postId)

        const comments = await this.commentRepository.listByPostId(postId)

        return {
            total_comments: comments.length,
            comments,
        }
    }

    async create(postId: string, data: CreateCommentDto) {
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
        const post = await this.postsService.findById(postId)
        if (!post) {
            throw new ResourceNotFoundError("Post no encontrado")
        }
    }
}
