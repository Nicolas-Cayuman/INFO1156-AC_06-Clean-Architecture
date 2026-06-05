export class Comment {
    id!: string
    postId!: string
    content!: string
    source!: string
    createdAt!: Date
    updatedAt!: Date

    constructor(partial: Partial<Comment>) {
        Object.assign(this, partial)
    }
}
