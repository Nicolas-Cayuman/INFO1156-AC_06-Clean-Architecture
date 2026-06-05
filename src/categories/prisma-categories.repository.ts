import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/shared/prisma.service"
import { Category } from "./category.entity"
import { ICategoryRepository } from "./categories.repository"

@Injectable()
export class PrismaCategoriesRepository implements ICategoryRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(): Promise<Category[]> {
        const categories = await this.prisma.category.findMany({
            orderBy: { name: "asc" },
        })

        return categories.map((category) => new Category(category))
    }
}
