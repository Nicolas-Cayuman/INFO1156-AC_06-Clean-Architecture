import { FeedPost, Post } from "./post.entity"
import { CreatePostDto } from "@/application/dtos/post.dtos"

export const I_POST_REPOSITORY = Symbol("IPostRepository")

export interface IPostRepository {
    create(data: CreatePostDto): Promise<Post>
    findAll(): Promise<Post[]>
    findById(id: string): Promise<Post | null>
    getFeedPosts(categoryId?: string): Promise<FeedPost[]>
}
