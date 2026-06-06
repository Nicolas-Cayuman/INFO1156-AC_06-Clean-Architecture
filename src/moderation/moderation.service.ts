import { Inject, Injectable } from "@nestjs/common"
import { ResourceNotFoundError } from "@/shared/domain-errors"
import {
    I_PROHIBITED_WORD_REPOSITORY,
    IProhibitedWordRepository,
} from "./moderation.repository"

export type ModerationResult = {
    approved: boolean
    reason?: string
    category?: string
}

const buildFuzzyRegex = (word: string) => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    return new RegExp(escaped.split("").join("[^a-zA-Z0-9]*"), "gi")
}

@Injectable()
export class ModerationService {
    constructor(
        @Inject(I_PROHIBITED_WORD_REPOSITORY)
        private readonly prohibitedWordRepository: IProhibitedWordRepository,
    ) {}

    async moderate(text: string): Promise<ModerationResult> {
        const words = await this.prohibitedWordRepository.findAll()

        for (const pw of words) {
            const regex = buildFuzzyRegex(pw.word)
            if (regex.test(text)) {
                return {
                    approved: false,
                    reason: `Contiene palabra prohibida: "${pw.word}"`,
                    category: pw.category,
                }
            }
        }

        return { approved: true }
    }

    findAll() {
        return this.prohibitedWordRepository.findAll()
    }

    create(word: string, category: string) {
        return this.prohibitedWordRepository.create(word, category)
    }

    async delete(id: string) {
        const deleted = await this.prohibitedWordRepository.delete(id)

        if (!deleted) {
            throw new ResourceNotFoundError("Palabra prohibida no encontrada")
        }

        return deleted
    }
}
