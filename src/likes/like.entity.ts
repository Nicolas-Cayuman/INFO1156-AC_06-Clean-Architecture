export class Like {
    id!: string
    postId!: string
    reactionType!: string
    weight!: number
    source!: string
    createdAt!: Date

    constructor(partial: Partial<Like>) {
        Object.assign(this, partial)
    }
}
