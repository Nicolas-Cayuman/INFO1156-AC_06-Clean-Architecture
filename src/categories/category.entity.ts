export class Category {
    id!: string
    name!: string
    slug!: string

    constructor(partial: Partial<Category>) {
        Object.assign(this, partial)
    }
}
