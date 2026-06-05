export class ProhibitedWord {
    id!: string
    word!: string
    category!: string
    createdAt!: Date

    constructor(partial: Partial<ProhibitedWord>) {
        Object.assign(this, partial)
    }
}
