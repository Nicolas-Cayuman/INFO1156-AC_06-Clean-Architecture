import { BadRequestException, Inject, Injectable } from "@nestjs/common"
import { CreatePostDto } from "@/posts/posts.dtos"
import { ModerationService } from "@/moderation/moderation.service"
import { I_POST_REPOSITORY, IPostRepository } from "./posts.repository"

@Injectable()
export class PostsService {
    constructor(
        @Inject(I_POST_REPOSITORY)
        private readonly postRepository: IPostRepository,
        private readonly moderationService: ModerationService,
    ) {}

    async create(data: CreatePostDto) {
        const text = `${data.title} ${data.description}`
        const moderation = await this.moderationService.moderate(text)

        if (!moderation.approved) {
            throw new BadRequestException(
                moderation.reason ?? "Post bloqueado por moderación",
            )
        }

        return await this.postRepository.create(data)
    }

    findAll() {
        return this.postRepository.findAll()
    }

    findById(id: string) {
        return this.postRepository.findById(id)
    }

    async getFeedPosts(categoryId?: string) {
        return this.postRepository.getFeedPosts(categoryId)
    }
}
