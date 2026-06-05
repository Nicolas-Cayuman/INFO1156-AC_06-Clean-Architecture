import { Like } from "./like.entity"

export const I_LIKE_REPOSITORY = Symbol("ILikeRepository")

export interface CreateLikeData {
    postId: string
    reactionType: string
    weight: number
    source: string
}

export interface ILikeRepository {
    create(data: CreateLikeData): Promise<Like>
}
