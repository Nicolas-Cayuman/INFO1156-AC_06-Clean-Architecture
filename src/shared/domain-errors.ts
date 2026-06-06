/**
 * Excepciones de dominio - agnósticas del transporte HTTP
 *
 * Estas excepciones representan errores de la lógica de negocio y son
 * independientes del protocolo de comunicación (HTTP, WebSockets, CLI, RabbitMQ, etc.)
 *
 * El mapeo a códigos HTTP se realiza en el DomainErrorFilter, permitiendo
 * reutilizar la lógica de negocio en diferentes contextos sin cambios.
 */

export abstract class DomainError extends Error {
    abstract readonly errorCode: string
    abstract readonly statusCode: number

    constructor(message: string) {
        super(message)
        this.name = new.target.name
        Object.setPrototypeOf(this, new.target.prototype)
    }
}

/**
 * Violación de una regla de negocio
 * Ejemplo: peso de like < 1, contenido rechazado por moderación
 * Mapea a: 400 Bad Request
 */
export class BusinessRuleViolationError extends DomainError {
    readonly errorCode = "BUSINESS_RULE_VIOLATION"
    readonly statusCode = 400

    constructor(message: string) {
        super(message)
        Object.setPrototypeOf(this, BusinessRuleViolationError.prototype)
    }
}

/**
 * Un recurso solicitado no existe
 * Ejemplo: post o comentario no encontrado
 * Mapea a: 404 Not Found
 */
export class ResourceNotFoundError extends DomainError {
    readonly errorCode = "RESOURCE_NOT_FOUND"
    readonly statusCode = 404

    constructor(message: string, public readonly resourceType?: string) {
        super(message)
        Object.setPrototypeOf(this, ResourceNotFoundError.prototype)
    }
}

/**
 * No autorizado a acceder a un recurso
 * Ejemplo: intento de modificar post de otro usuario
 * Mapea a: 403 Forbidden
 */
export class UnauthorizedAccessError extends DomainError {
    readonly errorCode = "UNAUTHORIZED_ACCESS"
    readonly statusCode = 403

    constructor(message: string, public readonly action?: string) {
        super(message)
        Object.setPrototypeOf(this, UnauthorizedAccessError.prototype)
    }
}

/**
 * Validación fallida de datos de entrada
 * Ejemplo: datos requeridos faltantes, formato inválido
 * Mapea a: 422 Unprocessable Entity
 */
export class ValidationError extends DomainError {
    readonly errorCode = "VALIDATION_ERROR"
    readonly statusCode = 422

    constructor(
        message: string,
        public readonly field?: string,
        public readonly constraints?: Record<string, any>,
    ) {
        super(message)
        Object.setPrototypeOf(this, ValidationError.prototype)
    }
}

/**
 * Conflicto de datos (ej. entidad duplicada)
 * Ejemplo: intento de crear categoría con nombre existente
 * Mapea a: 409 Conflict
 */
export class ConflictError extends DomainError {
    readonly errorCode = "CONFLICT"
    readonly statusCode = 409

    constructor(message: string, public readonly conflictingField?: string) {
        super(message)
        Object.setPrototypeOf(this, ConflictError.prototype)
    }
}
