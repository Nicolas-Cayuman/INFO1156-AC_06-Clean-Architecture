/**
 * Patrones comunes para usar excepciones de dominio
 * 
 * Este archivo sirve como referencia rápida para implementaciones típicas
 */

// ============================================================================
// PATRÓN 1: Validación de entrada
// ============================================================================
// Usado en: Servicios que reciben DTOs

/*
async validateAndProcess(data: CreatePostDto) {
    if (!data.title || data.title.trim().length === 0) {
        throw new ValidationError(
            'El título no puede estar vacío',
            'title',
            { required: true }
        )
    }

    if (data.title.length > 200) {
        throw new ValidationError(
            'El título no puede exceder 200 caracteres',
            'title',
            { maxLength: 200, current: data.title.length }
        )
    }

    if (data.description && data.description.length > 5000) {
        throw new ValidationError(
            'La descripción no puede exceder 5000 caracteres',
            'description',
            { maxLength: 5000, current: data.description.length }
        )
    }

    return await this.repository.create(data)
}
*/

// ============================================================================
// PATRÓN 2: Validación de recurso existente
// ============================================================================
// Usado en: Búsquedas, obtener por ID

/*
async findPostOrThrow(id: string): Promise<Post> {
    const post = await this.postRepository.findById(id)

    if (!post) {
        throw new ResourceNotFoundError(
            `Post con ID "${id}" no encontrado`,
            'Post'
        )
    }

    return post
}
*/

// ============================================================================
// PATRÓN 3: Validación de regla de negocio
// ============================================================================
// Usado en: Lógica de negocio compleja

/*
async createLike(postId: string, weight: number) {
    const post = await this.findPostOrThrow(postId)

    // Regla: El peso debe ser entre 1 y 5
    if (weight < 1 || weight > 5) {
        throw new BusinessRuleViolationError(
            `El peso debe estar entre 1 y 5, recibido: ${weight}`
        )
    }

    // Regla: No puedes dar like a un post dos veces
    const existingLike = await this.likeRepository.findByPostAndUser(
        postId,
        this.currentUserId,
    )
    if (existingLike) {
        throw new ConflictError(
            'Ya has dado like a este post',
            'post_user_unique'
        )
    }

    return await this.likeRepository.create({
        postId,
        weight,
        userId: this.currentUserId,
    })
}
*/

// ============================================================================
// PATRÓN 4: Validación de moderación
// ============================================================================
// Usado en: Servicios que aplican reglas de moderación

/*
async createCommentWithModeration(postId: string, content: string) {
    const post = await this.findPostOrThrow(postId)

    // Aplicar moderación
    const moderation = await this.moderationService.moderate(content)

    if (!moderation.approved) {
        throw new BusinessRuleViolationError(
            moderation.reason || 'El contenido ha sido bloqueado por moderación'
        )
    }

    return await this.commentRepository.create({
        postId,
        content,
        source: 'comments-module',
    })
}
*/

// ============================================================================
// PATRÓN 5: Validación de acceso / autorización
// ============================================================================
// Usado en: Servicios que verifican permisos

/*
async updatePost(postId: string, userId: string, data: UpdatePostDto) {
    const post = await this.findPostOrThrow(postId)

    // Regla: Solo el autor puede modificar su post
    if (post.authorId !== userId) {
        throw new UnauthorizedAccessError(
            'No tienes permiso para modificar este post',
            'updatePost'
        )
    }

    return await this.postRepository.update(postId, data)
}
*/

// ============================================================================
// PATRÓN 6: Validación de unicidad
// ============================================================================
// Usado en: Crear recursos con campos únicos

/*
async createCategory(name: string) {
    const existing = await this.categoryRepository.findByName(name)

    if (existing) {
        throw new ConflictError(
            `Una categoría con el nombre "${name}" ya existe`,
            'name'
        )
    }

    return await this.categoryRepository.create({ name })
}
*/

// ============================================================================
// PATRÓN 7: Composición de validaciones
// ============================================================================
// Usado en: Servicios con múltiples validaciones

/*
async deleteProhibitedWord(id: string, requestingUserId: string) {
    // Validación 1: Recurso existe
    const word = await this.findWordOrThrow(id)

    // Validación 2: Permisos
    if (!this.isAdmin(requestingUserId)) {
        throw new UnauthorizedAccessError(
            'Solo administradores pueden eliminar palabras prohibidas',
            'deleteProhibitedWord'
        )
    }

    // Validación 3: Lógica de negocio
    if (word.isSystemWord) {
        throw new BusinessRuleViolationError(
            'No puedes eliminar palabras prohibidas del sistema'
        )
    }

    return await this.prohibitedWordRepository.delete(id)
}
*/

// ============================================================================
// PATRÓN 8: Manejo de errores en composición de servicios
// ============================================================================
// Usado en: Cuando un servicio llama a otros servicios

/*
async createPostWithCategory(data: CreatePostWithCategoryDto) {
    // Las excepciones se propagan automáticamente
    // No necesitas atraparlas, el filtro global las maneja

    // Si la categoría no existe, esto lanzará ResourceNotFoundError
    const category = await this.categoriesService.findByIdOrThrow(data.categoryId)

    // Si hay duplicado, esto lanzará ConflictError
    const post = await this.postsService.create({
        ...data,
        categoryId: category.id,
    })

    return post
}
*/

// ============================================================================
// TESTING: Cómo probar excepciones de dominio
// ============================================================================

/*
describe('PostsService - Exception Handling', () => {
    it('should throw ResourceNotFoundError when post does not exist', async () => {
        // Arrange
        const nonExistentId = 'non-existent-id'

        // Act & Assert
        await expect(
            service.findByIdOrThrow(nonExistentId)
        ).rejects.toThrow(ResourceNotFoundError)

        await expect(
            service.findByIdOrThrow(nonExistentId)
        ).rejects.toThrow('Post no encontrado')
    })

    it('should throw BusinessRuleViolationError when moderation fails', async () => {
        // Arrange
        const bannedContent = 'contenido prohibido'
        const mockModeration = { approved: false, reason: 'Contiene palabra prohibida' }
        jest.spyOn(moderationService, 'moderate').mockResolvedValue(mockModeration)

        // Act & Assert
        await expect(
            service.create({ title: bannedContent, description: 'test' })
        ).rejects.toThrow(BusinessRuleViolationError)

        await expect(
            service.create({ title: bannedContent, description: 'test' })
        ).rejects.toThrow('Contiene palabra prohibida')
    })

    it('should throw ConflictError when trying to like twice', async () => {
        // Arrange
        const postId = 'post-1'
        jest.spyOn(likeRepository, 'findByPostAndUser').mockResolvedValue({
            id: 'like-1',
            postId,
            userId: 'user-1',
            weight: 1,
        })

        // Act & Assert
        await expect(
            service.create(postId, { weight: 1 })
        ).rejects.toThrow(ConflictError)

        await expect(
            service.create(postId, { weight: 1 })
        ).rejects.toThrow('Ya has dado like a este post')
    })

    it('should throw ValidationError when weight is invalid', async () => {
        // Act & Assert
        await expect(
            service.create('post-1', { weight: 0 })
        ).rejects.toThrow(ValidationError)

        const error = await expect(
            service.create('post-1', { weight: 0 })
        ).rejects.toThrow() as ValidationError

        expect(error.field).toBe('weight')
        expect(error.constraints).toEqual({ min: 1 })
    })
})
*/

export default {}
