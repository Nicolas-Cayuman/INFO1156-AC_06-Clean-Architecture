import { ICommentRepository } from "@/comments/comments.repository"
import { Comment } from "@/comments/comment.entity"
import { IPostRepository } from "@/posts/posts.repository"
import { ResourceNotFoundError } from "@/shared/domain-errors"

export class ListCommentsByPostUseCase {
    constructor(
        private readonly commentRepository: ICommentRepository,
        private readonly postRepository: IPostRepository,
    ) {}

    async execute(postId: string): Promise<{
        total_comments: number
        comments: Comment[]
    }> {
        await this.assertPostExists(postId)

        const comments = await this.commentRepository.listByPostId(postId)

        return {
            total_comments: comments.length,
            comments,
        }
    }

    private async assertPostExists(postId: string) {
        const post = await this.postRepository.findById(postId)
        if (!post) {
            throw new ResourceNotFoundError("Post no encontrado")
        }
    }
}