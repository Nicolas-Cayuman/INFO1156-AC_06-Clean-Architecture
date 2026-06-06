import { ResourceNotFoundError } from "@/shared/domain-errors"
import { IPostRepository } from "@/posts/posts.repository"
import { Post } from "@/posts/post.entity"

export class GetPostByIdUseCase {
    constructor(private readonly postRepository: IPostRepository) {}

    async execute(id: string): Promise<Post> {
        const post = await this.postRepository.findById(id)

        if (!post) {
            throw new ResourceNotFoundError("Post no encontrado")
        }

        return post
    }
}