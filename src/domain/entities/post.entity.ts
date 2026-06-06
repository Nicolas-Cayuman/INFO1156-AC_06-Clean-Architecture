import { ValidationError } from "@/shared/domain-errors"

export class Post {
    readonly id?: string
    readonly title: string
    readonly description: string
    readonly imageUrl: string
    readonly categoryId: string | null
    readonly createdAt?: Date
    readonly updatedAt?: Date

    // Atributos de lectura adicionales para la vista agregada (Feed)
    readonly categoryName?: string | null
    readonly likesCount?: number
    readonly commentsCount?: number
    readonly relevanceScore?: number

    constructor(properties: {
        id?: string
        title: string
        description: string
        imageUrl: string
        categoryId?: string | null
        createdAt?: Date
        updatedAt?: Date
        categoryName?: string | null
        likesCount?: number
        commentsCount?: number
        relevanceScore?: number
    }) {
        this.validate(properties)

        this.id = properties.id
        this.title = properties.title
        this.description = properties.description
        this.imageUrl = properties.imageUrl
        this.categoryId = properties.categoryId ?? null
        this.createdAt = properties.createdAt
        this.updatedAt = properties.updatedAt
        this.categoryName = properties.categoryName
        this.likesCount = properties.likesCount
        this.commentsCount = properties.commentsCount
        this.relevanceScore = properties.relevanceScore
    }

    private validate(props: { title: string; description: string; imageUrl: string }) {
        const noHtmlPattern = /^[^<>]*$/
        const noHtmlMessage = "No se permiten etiquetas HTML"

        // Validar Título
        if (!props.title || props.title.trim().length === 0) {
            throw new ValidationError("El título no puede estar vacío", "title")
        }
        if (props.title.length < 3 || props.title.length > 120) {
            throw new ValidationError(
                "El título debe tener entre 3 y 120 caracteres",
                "title",
            )
        }
        if (!noHtmlPattern.test(props.title)) {
            throw new ValidationError(noHtmlMessage, "title")
        }

        // Validar Descripción
        if (!props.description || props.description.trim().length === 0) {
            throw new ValidationError(
                "La descripción no puede estar vacía",
                "description",
            )
        }
        if (props.description.length < 10 || props.description.length > 1000) {
            throw new ValidationError(
                "La descripción debe tener entre 10 y 1000 caracteres",
                "description",
            )
        }
        if (!noHtmlPattern.test(props.description)) {
            throw new ValidationError(noHtmlMessage, "description")
        }

        // Validar Imagen URL
        if (!props.imageUrl || props.imageUrl.trim().length === 0) {
            throw new ValidationError(
                "La URL de imagen no puede estar vacía",
                "imageUrl",
            )
        }
        if (props.imageUrl.length > 2048) {
            throw new ValidationError(
                "La URL de imagen no puede superar los 2048 caracteres",
                "imageUrl",
            )
        }
        if (!noHtmlPattern.test(props.imageUrl)) {
            throw new ValidationError(noHtmlMessage, "imageUrl")
        }
        try {
            new URL(props.imageUrl)
        } catch {
            throw new ValidationError("La URL de imagen no es válida", "imageUrl")
        }
    }
}

export type FeedPost = Post & {
    categoryName: string | null
    likesCount: number
    commentsCount: number
    relevanceScore: number
}
