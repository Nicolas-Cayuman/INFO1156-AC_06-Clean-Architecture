import { AddLikeDto } from "@/application/dtos/post.dtos"
import { Like } from "@/likes/like.entity"
import { ILikeRepository } from "@/likes/likes.repository"
import { IPostRepository } from "@/posts/posts.repository"
import {
    BusinessRuleViolationError,
    ResourceNotFoundError,
} from "@/shared/domain-errors"

export class AddLikeUseCase {
    constructor(
        private readonly likeRepository: ILikeRepository,
        private readonly postRepository: IPostRepository,
    ) {}

    async execute(postId: string, data: AddLikeDto): Promise<Like> {
        await this.assertPostExists(postId)

        const weight = data.weight ?? 1

        if (weight < 1) {
            throw new BusinessRuleViolationError("El peso debe ser al menos 1")
        }

        return this.likeRepository.create({
            postId,
            reactionType: data.reactionType ?? "like",
            weight,
            source: "likes-module",
        })
    }

    private async assertPostExists(postId: string) {
        const post = await this.postRepository.findById(postId)

        if (!post) {
            throw new ResourceNotFoundError("Post no encontrado")
        }
    }
}