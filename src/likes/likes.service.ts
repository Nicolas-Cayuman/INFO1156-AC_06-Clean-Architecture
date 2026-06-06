import { Inject, Injectable } from "@nestjs/common"
import { AddLikeDto } from "@/posts/posts.dtos"
import { I_POST_REPOSITORY, IPostRepository } from "@/posts/posts.repository"
import {
    BusinessRuleViolationError,
    ResourceNotFoundError,
} from "@/shared/domain-errors"
import { I_LIKE_REPOSITORY, ILikeRepository } from "./likes.repository"

@Injectable()
export class LikesService {
    constructor(
        @Inject(I_LIKE_REPOSITORY)
        private readonly likeRepository: ILikeRepository,
        @Inject(I_POST_REPOSITORY)
        private readonly postRepository: IPostRepository,
    ) {}

    async create(postId: string, data: AddLikeDto) {
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
