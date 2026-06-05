import { Inject, Injectable } from "@nestjs/common"
import {
    I_CATEGORY_REPOSITORY,
    ICategoryRepository,
} from "./categories.repository"

@Injectable()
export class CategoriesService {
    constructor(
        @Inject(I_CATEGORY_REPOSITORY)
        private readonly categoryRepository: ICategoryRepository,
    ) {}

    findAll() {
        return this.categoryRepository.findAll()
    }
}
