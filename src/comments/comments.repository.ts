import { Comment } from "./comment.entity"

export const I_COMMENT_REPOSITORY = Symbol("ICommentRepository")

export interface CreateCommentData {
    postId: string
    content: string
    source: string
}

export interface ICommentRepository {
    listByPostId(postId: string): Promise<Comment[]>
    create(data: CreateCommentData): Promise<Comment>
}
