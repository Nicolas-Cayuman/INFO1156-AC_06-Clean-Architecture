import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpStatus,
    Logger,
} from "@nestjs/common"
import {
    BusinessRuleViolationError,
    ConflictError,
    DomainError,
    ResourceNotFoundError,
    UnauthorizedAccessError,
    ValidationError,
} from "@/shared/domain-errors"

/**
 * Filtro de excepciones de dominio
 *
 * Mapea excepciones agnósticas de dominio a respuestas HTTP apropiadas.
 * Esto permite que la lógica de negocio permanezca independiente del protocolo.
 *
 * Flujo:
 * 1. Servicio lanza excepción de dominio
 * 2. Controlador NO la atrapa (se propaga)
 * 3. Este filtro global la intercepta
 * 4. Se convierte a respuesta HTTP apropiada
 */
@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
    private readonly logger = new Logger(DomainErrorFilter.name)

    catch(exception: DomainError, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse()
        const request = ctx.getRequest()

        const status = this.getStatus(exception)
        const errorResponse = this.buildErrorResponse(exception, status, request)

        this.logger.warn(
            `[${request.method}] ${request.url} - ${exception.name}: ${exception.message}`,
        )

        response.status(status).json(errorResponse)
    }

    private getStatus(exception: DomainError): HttpStatus {
        // Usar el statusCode de la excepción si está disponible
        if (exception.statusCode) {
            return exception.statusCode
        }

        // Fallback para excepciones sin statusCode
        if (exception instanceof ResourceNotFoundError) {
            return HttpStatus.NOT_FOUND
        }
        if (exception instanceof BusinessRuleViolationError) {
            return HttpStatus.BAD_REQUEST
        }
        if (exception instanceof UnauthorizedAccessError) {
            return HttpStatus.FORBIDDEN
        }
        if (exception instanceof ValidationError) {
            return HttpStatus.UNPROCESSABLE_ENTITY
        }
        if (exception instanceof ConflictError) {
            return HttpStatus.CONFLICT
        }

        return HttpStatus.BAD_REQUEST
    }

    private buildErrorResponse(
        exception: DomainError,
        status: HttpStatus,
        request: any,
    ) {
        const baseResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            error: this.getHttpErrorName(status),
            message: exception.message,
        }

        // Agregar información adicional según el tipo de excepción
        if (exception instanceof ValidationError) {
            return {
                ...baseResponse,
                field: exception.field,
                constraints: exception.constraints,
            }
        }

        if (exception instanceof ResourceNotFoundError) {
            return {
                ...baseResponse,
                resourceType: exception.resourceType,
            }
        }

        if (exception instanceof ConflictError) {
            return {
                ...baseResponse,
                conflictingField: exception.conflictingField,
            }
        }

        if (exception instanceof UnauthorizedAccessError) {
            return {
                ...baseResponse,
                action: exception.action,
            }
        }

        return baseResponse
    }

    private getHttpErrorName(status: number): string {
        switch (status) {
            case HttpStatus.BAD_REQUEST:
                return "Bad Request"
            case HttpStatus.NOT_FOUND:
                return "Not Found"
            case HttpStatus.FORBIDDEN:
                return "Forbidden"
            case HttpStatus.UNPROCESSABLE_ENTITY:
                return "Unprocessable Entity"
            case HttpStatus.CONFLICT:
                return "Conflict"
            default:
                return "Internal Server Error"
        }
    }
}
