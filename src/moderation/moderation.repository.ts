import { ProhibitedWord } from "./prohibited-word.entity"

export const I_PROHIBITED_WORD_REPOSITORY = Symbol("IProhibitedWordRepository")

export interface IProhibitedWordRepository {
    findAll(): Promise<ProhibitedWord[]>
    create(word: string, category: string): Promise<ProhibitedWord>
    delete(id: string): Promise<ProhibitedWord | null>
}
