import { Module } from "@nestjs/common"
import { CategoriesController } from "@/categories/categories.controller"
import { CategoriesService } from "@/categories/categories.service"
import { PrismaCategoriesRepository } from "./prisma-categories.repository"
import { I_CATEGORY_REPOSITORY } from "./categories.repository"

@Module({
    controllers: [CategoriesController],
    providers: [
        CategoriesService,
        {
            provide: I_CATEGORY_REPOSITORY,
            useClass: PrismaCategoriesRepository,
        },
    ],
})
export class CategoriesModule {}
