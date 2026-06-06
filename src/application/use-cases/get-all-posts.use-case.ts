import { IPostRepository } from "@/posts/posts.repository"
import { Post } from "@/posts/post.entity"

export class GetAllPostsUseCase {
    constructor(private readonly postRepository: IPostRepository) {}

    async execute(): Promise<Post[]> {
        return this.postRepository.findAll()
    }
}