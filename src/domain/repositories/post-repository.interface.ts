import { FeedPost, Post } from "../entities/post.entity"

export const I_POST_REPOSITORY = Symbol("IPostRepository")

export interface IPostRepository {
    create(post: Post): Promise<Post>
    findAll(): Promise<Post[]>
    findById(id: string): Promise<Post | null>
    getFeedPosts(categoryId?: string): Promise<FeedPost[]>
}
