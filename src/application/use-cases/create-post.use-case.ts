import { BusinessRuleViolationError } from "@/shared/domain-errors"
import { ModerationService } from "@/moderation/moderation.service"
import { CreatePostDto } from "@/application/dtos/post.dtos"
import { IPostRepository } from "@/posts/posts.repository"
import { Post } from "@/posts/post.entity"

export class CreatePostUseCase {
    constructor(
        private readonly postRepository: IPostRepository,
        private readonly moderationService: ModerationService,
    ) {}

    async execute(data: CreatePostDto): Promise<Post> {
        const text = `${data.title} ${data.description}`
        const moderation = await this.moderationService.moderate(text)

        if (!moderation.approved) {
            throw new BusinessRuleViolationError(
                moderation.reason ?? "Post bloqueado por moderación",
            )
        }

        return this.postRepository.create(data)
    }
}