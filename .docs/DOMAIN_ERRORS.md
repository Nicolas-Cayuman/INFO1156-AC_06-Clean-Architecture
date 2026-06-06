# Guía de Excepciones de Dominio

## Problema Resuelto

### ❌ Antes: Acoplamiento a HTTP

Lanzar excepciones HTTP directas en los servicios acoplaba la lógica de negocio al protocolo HTTP:

```typescript
// ❌ INCORRECTO - Acoplado a HTTP
import { BadRequestException, NotFoundException } from '@nestjs/common'

@Injectable()
export class PostsService {
    async create(data: CreatePostDto) {
        if (!data.title) {
            throw new BadRequestException('Título es requerido') // HTTP-específico
        }
        
        if (!await this.postExists(data.id)) {
            throw new NotFoundException('Post no encontrado') // HTTP-específico
        }
    }
}
```

**Problemas:**
- No se podría reutilizar en CLI, WebSockets, RabbitMQ, etc.
- Dependencia de `@nestjs/common` en lógica de negocio
- No es agnóstico del transporte

### ✅ Después: Excepciones de Dominio

Lanzar excepciones de dominio que son agnósticas del transporte:

```typescript
// ✅ CORRECTO - Agnóstico del transporte
import { BusinessRuleViolationError, ResourceNotFoundError } from '@/shared/domain-errors'

@Injectable()
export class PostsService {
    async create(data: CreatePostDto) {
        if (!data.title) {
            throw new BusinessRuleViolationError('Título es requerido')
        }
        
        if (!await this.postExists(data.id)) {
            throw new ResourceNotFoundError('Post no encontrado')
        }
    }
}
```

**Ventajas:**
- Lógica de negocio completamente agnóstica del transporte
- Se puede reutilizar en cualquier contexto (HTTP, CLI, WebSockets, eventos, etc.)
- Sin dependencias de framework específico
- El mapeo a HTTP ocurre en el filtro (responsabilidad del adaptador)

## Arquitectura

```
┌─────────────────────────────────────────────────────┐
│         Controlador (HTTP Adapter)                  │
├─────────────────────────────────────────────────────┤
│  @Post()                                            │
│  create(@Body() dto) {                              │
│    return this.service.create(dto)  // Propaga     │
│  }                                                  │
└────────────────────┬────────────────────────────────┘
                     │
                     │ Excepción sin atrapar
                     ↓
┌─────────────────────────────────────────────────────┐
│  DomainErrorFilter (Exception Handler)              │
├─────────────────────────────────────────────────────┤
│  @Catch(DomainError)                                │
│  - Intercepta excepciones de dominio                │
│  - Mapea a HTTP status codes                        │
│  - Retorna JSON con estructura estandarizada        │
└─────────────────────────────────────────────────────┘
```

## Excepciones Disponibles

### 1. BusinessRuleViolationError

**Cuándo usar:** Cuando se viola una regla de negocio.

**HTTP Status:** `400 Bad Request`

**Ejemplos:**
- Peso de like menor a 1
- Contenido rechazado por moderación
- Usuario intenta crear un favorito duplicado

```typescript
import { BusinessRuleViolationError } from '@/shared/domain-errors'

async create(postId: string, data: AddLikeDto) {
    if (data.weight < 1) {
        throw new BusinessRuleViolationError('El peso debe ser al menos 1')
    }
}
```

### 2. ResourceNotFoundError

**Cuándo usar:** Cuando se intenta acceder a un recurso que no existe.

**HTTP Status:** `404 Not Found`

**Ejemplos:**
- Post no encontrado
- Comentario no encontrado
- Palabra prohibida no encontrada

```typescript
import { ResourceNotFoundError } from '@/shared/domain-errors'

async delete(id: string) {
    const deleted = await this.prohibitedWordRepository.delete(id)
    
    if (!deleted) {
        throw new ResourceNotFoundError('Palabra prohibida no encontrada', 'ProhibitedWord')
    }
}
```

### 3. UnauthorizedAccessError

**Cuándo usar:** Cuando no está autorizado a acceder a un recurso.

**HTTP Status:** `403 Forbidden`

**Ejemplos:**
- Usuario intenta modificar post de otro
- Intento de acceso a recurso protegido

```typescript
import { UnauthorizedAccessError } from '@/shared/domain-errors'

async updatePost(postId: string, userId: string, data: UpdatePostDto) {
    const post = await this.getPost(postId)
    
    if (post.authorId !== userId) {
        throw new UnauthorizedAccessError(
            'No autorizado para modificar este post',
            'updatePost'
        )
    }
}
```

### 4. ValidationError

**Cuándo usar:** Para errores de validación de datos.

**HTTP Status:** `422 Unprocessable Entity`

**Ejemplos:**
- Datos requeridos faltantes
- Formato inválido
- Restricciones de negocio no cumplidas

```typescript
import { ValidationError } from '@/shared/domain-errors'

async validateInput(data: any) {
    if (!data.title) {
        throw new ValidationError(
            'Título es requerido',
            'title',
            { required: true }
        )
    }
    
    if (data.title.length > 200) {
        throw new ValidationError(
            'Título no puede exceder 200 caracteres',
            'title',
            { maxLength: 200, actual: data.title.length }
        )
    }
}
```

### 5. ConflictError

**Cuándo usar:** Cuando hay un conflicto (ej. entidad duplicada).

**HTTP Status:** `409 Conflict`

**Ejemplos:**
- Intento de crear categoría con nombre existente
- Violación de unicidad

```typescript
import { ConflictError } from '@/shared/domain-errors'

async createCategory(name: string) {
    const exists = await this.categoryRepository.findByName(name)
    
    if (exists) {
        throw new ConflictError(
            'Una categoría con este nombre ya existe',
            'name'
        )
    }
}
```

## Patrón de Uso

### En Servicios

```typescript
import { Injectable, Inject } from '@nestjs/common'
import {
    BusinessRuleViolationError,
    ResourceNotFoundError,
} from '@/shared/domain-errors'

@Injectable()
export class PostsService {
    constructor(
        @Inject(I_POST_REPOSITORY)
        private readonly postRepository: IPostRepository,
        private readonly moderationService: ModerationService,
    ) {}

    async create(data: CreatePostDto) {
        // Validar reglas de negocio
        const moderation = await this.moderationService.moderate(data.title)
        if (!moderation.approved) {
            throw new BusinessRuleViolationError(
                moderation.reason ?? 'Post bloqueado por moderación'
            )
        }

        return await this.postRepository.create(data)
    }

    async findById(id: string) {
        const post = await this.postRepository.findById(id)
        
        if (!post) {
            throw new ResourceNotFoundError(
                'Post no encontrado',
                'Post'
            )
        }
        
        return post
    }
}
```

### En Controladores

Los controladores **NO deben** capturar estas excepciones. Deben dejarlas propagarse:

```typescript
import { Body, Controller, Get, Param, Post } from '@nestjs/common'

@Controller('api/posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) {}

    @Post()
    async create(@Body() body: CreatePostDto) {
        // ✅ La excepción se propaga automáticamente
        const created = await this.postsService.create(body)
        
        return {
            ok: true,
            payload: created,
        }
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        // ✅ La excepción se propaga automáticamente
        const post = await this.postsService.findById(id)
        
        return {
            ok: true,
            payload: post,
        }
    }
}
```

## Respuestas HTTP Generadas

### BusinessRuleViolationError (400)

```json
{
    "statusCode": 400,
    "timestamp": "2026-06-05T10:30:00.000Z",
    "path": "/api/posts/1/likes",
    "error": "Bad Request",
    "message": "El peso debe ser al menos 1"
}
```

### ResourceNotFoundError (404)

```json
{
    "statusCode": 404,
    "timestamp": "2026-06-05T10:30:00.000Z",
    "path": "/api/posts/999",
    "error": "Not Found",
    "message": "Post no encontrado",
    "resourceType": "Post"
}
```

### ValidationError (422)

```json
{
    "statusCode": 422,
    "timestamp": "2026-06-05T10:30:00.000Z",
    "path": "/api/posts",
    "error": "Unprocessable Entity",
    "message": "Título es requerido",
    "field": "title",
    "constraints": {
        "required": true
    }
}
```

### ConflictError (409)

```json
{
    "statusCode": 409,
    "timestamp": "2026-06-05T10:30:00.000Z",
    "path": "/api/categories",
    "error": "Conflict",
    "message": "Una categoría con este nombre ya existe",
    "conflictingField": "name"
}
```

## Recomendaciones

### ✅ Hacer

1. **Lanzar excepciones de dominio en servicios** - Mantén la lógica de negocio agnóstica
2. **Dejar que se propaguen en controladores** - No las captures, deja que el filtro las maneje
3. **Usar el tipo específico de excepción** - `ResourceNotFoundError` para no encontrado, no `BusinessRuleViolationError`
4. **Proporcionar mensajes descriptivos** - Ayuda al cliente a entender qué salió mal
5. **Usar los parámetros opcionales** - `resourceType`, `field`, `constraints` para información adicional

### ❌ No Hacer

```typescript
// ❌ No capturar y re-lanzar excepciones HTTP
try {
    await this.create(data)
} catch (error) {
    throw new BadRequestException(error.message) // ❌ Incorrecto
}

// ❌ No mezclar excepciones HTTP con dominio
if (!data.title) {
    throw new BadRequestException('Requerido') // ❌ Incorrecto
}

// ❌ No capturar excepciones de dominio en controladores
try {
    return this.service.create(data)
} catch (error) {
    // ❌ El filtro no lo procesará
    return { error: error.message }
}
```

## Extensibilidad

Para agregar nuevas excepciones de dominio:

1. Extiende `DomainError`:

```typescript
export class InsufficientCreditsError extends DomainError {
    readonly errorCode = "INSUFFICIENT_CREDITS"
    readonly statusCode = 402 // Payment Required

    constructor(
        message: string,
        public readonly requiredCredits: number,
        public readonly availableCredits: number,
    ) {
        super(message)
        Object.setPrototypeOf(this, InsufficientCreditsError.prototype)
    }
}
```

2. Actualiza `domain-error.filter.ts` para manejarla:

```typescript
private buildErrorResponse(exception: DomainError, status: HttpStatus, request: any) {
    // ... código existente ...
    
    if (exception instanceof InsufficientCreditsError) {
        return {
            ...baseResponse,
            requiredCredits: exception.requiredCredits,
            availableCredits: exception.availableCredits,
        }
    }
}
```

## Referencias

- [Clean Architecture - Exception Handling](https://blog.cleancoder.com/)
- [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)
- [Domain-Driven Design - Error Handling](https://martinfowler.com/bliki/DomainDrivenDesign.html)
