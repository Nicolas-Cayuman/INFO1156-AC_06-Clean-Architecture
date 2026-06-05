import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/shared/prisma.service"
import { IProhibitedWordRepository } from "./moderation.repository"
import { ProhibitedWord } from "./prohibited-word.entity"

@Injectable()
export class PrismaModerationRepository implements IProhibitedWordRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(): Promise<ProhibitedWord[]> {
        const words = await this.prisma.prohibitedWord.findMany({
            orderBy: { createdAt: "desc" },
        })

        return words.map((word) => new ProhibitedWord(word))
    }

    async create(word: string, category: string): Promise<ProhibitedWord> {
        const created = await this.prisma.prohibitedWord.create({
            data: { word, category },
        })

        return new ProhibitedWord(created)
    }

    async delete(id: string): Promise<ProhibitedWord | null> {
        try {
            const deleted = await this.prisma.prohibitedWord.delete({
                where: { id },
            })

            return new ProhibitedWord(deleted)
        } catch (err: unknown) {
            if (
                err instanceof Error &&
                "code" in err &&
                (err as { code: string }).code === "P2025"
            ) {
                return null
            }

            throw err
        }
    }
}
