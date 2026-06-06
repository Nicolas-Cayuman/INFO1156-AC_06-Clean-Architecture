/**
 * Barrel file para exportar todas las excepciones de dominio
 * 
 * Permite importar con: import { BusinessRuleViolationError } from '@/shared/errors'
 * En lugar de: import { BusinessRuleViolationError } from '@/shared/domain-errors'
 */

export {
    DomainError,
    BusinessRuleViolationError,
    ResourceNotFoundError,
    UnauthorizedAccessError,
    ValidationError,
    ConflictError,
} from '@/shared/domain-errors'

export { DomainErrorFilter } from '@/shared/domain-error.filter'
