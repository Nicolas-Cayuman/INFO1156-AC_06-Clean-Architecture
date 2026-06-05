import { Category } from "./category.entity"

export const I_CATEGORY_REPOSITORY = Symbol("ICategoryRepository")

export interface ICategoryRepository {
    findAll(): Promise<Category[]>
}
