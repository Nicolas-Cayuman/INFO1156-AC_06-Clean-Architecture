# Análisis Arquitectónico y Propuesta de Refactorización hacia Clean Architecture

Este documento detalla las falencias arquitectónicas actuales identificadas en la aplicación del **Feed de Publicaciones**, los patrones de diseño aplicables con su respectiva justificación y una propuesta estructurada para migrar el servidor hacia **Clean Architecture** (Arquitectura Limpia).

---

## 1. Falencias Identificadas en el Código Actual

Actualmente, el proyecto está estructurado bajo una arquitectura clásica por capas de NestJS (Controladores -> Servicios -> Base de Datos con Prisma), lo que genera varias deficiencias desde el punto de vista de diseño de software:

### A. Acoplamiento directo al Framework (NestJS) y al ORM (Prisma)
* **Descripción:** Los servicios (por ejemplo, [posts.service.ts](INFO1156-AC_06-Clean-Architecture/src/posts/posts.service.ts)) importan e inyectan directamente el `PrismaService` y manejan la base de datos a través de consultas nativas de Prisma (`this.prisma.post.create(...)`). 
* **Impacto:** Si se decide cambiar el ORM (por ejemplo, a TypeORM o Mongoose) o el motor de persistencia, toda la lógica de negocio contenida en los servicios deberá ser reescrita. No hay separación entre el negocio y la infraestructura de almacenamiento.

### B. Mezcla de Excepciones del Framework con Lógica de Negocio
* **Descripción:** En la capa de servicios ([comments.service.ts](INFO1156-AC_06-Clean-Architecture/src/comments/comments.service.ts)), se lanzan directamente excepciones HTTP nativas de NestJS como `BadRequestException` o `NotFoundException`.
* **Impacto:** Las reglas de negocio quedan ligadas al protocolo HTTP. Si esta lógica se consumiera mediante una interfaz de CLI, WebSockets o colas de mensería (RabbitMQ), el código lanzaría excepciones de respuesta web que no corresponden a dichos contextos.

### C. Ausencia de Entidades del Dominio (Modelo Anémico)
* **Descripción:** Las entidades del sistema son definidas implícitamente por los tipos generados por Prisma (`Post`, `Comment`, etc.) o DTOs planos. No existen clases que encapsulen las reglas y comportamientos de las entidades de forma pura.
* **Impacto:** Los datos viajan como objetos planos estructurados y la lógica sobre ellos (por ejemplo, calcular el `relevanceScore` o moderar un texto) se dispersa en servicios de NestJS en vez de estar autocontenida en la entidad de dominio correspondiente.

### D. Violación de Responsabilidades en el Controlador (Orquestación del Feed)
* **Descripción:** En [posts.controller.ts](INFO1156-AC_06-Clean-Architecture/src/posts/posts.controller.ts#L34-L47), el controlador no solo recibe la petición HTTP, sino que además ejecuta lógica de negocio al instanciar la estrategia de ordenamiento del feed:
  ```typescript
  const feedPosts = await this.postsService.getFeedPosts(query.categoryId)
  const rankedPosts = this.feedRankingFactory
      .forMode(mode)
      .rank(feedPosts)
  ```
* **Impacto:** La orquestación y flujo del negocio (cómo se obtienen y ordenan los posts) debería vivir en la lógica de aplicación (un caso de uso), no en la capa HTTP.

---

## 2. Patrones Arquitectónicos Aplicables y Justificación

Para resolver estas falencias, se propone aplicar los siguientes patrones de diseño y principios de arquitectura:

| Patrón / Principio | Justificación Aplicada al Proyecto |
| :--- | :--- |
| **Ports and Adapters (Arquitectura Hexagonal)** | Aísla el núcleo de negocio de la aplicación (los Posts, Comentarios y su moderación) de los detalles de infraestructura (Prisma, SQLite, NestJS, controladores HTTP). Permite testear el negocio de forma pura y rápida sin requerir una base de datos activa. |
| **Repository Pattern (Patrón Repositorio)** | Abstrae la persistencia mediante interfaces (Puertos). La lógica de negocio consume `IPostRepository` e `ICommentRepository`, mientras que la implementación con Prisma pasa a ser un Adaptador externo. |
| **Strategy Pattern (Patrón Estrategia)** | *Ya existe en el proyecto*, pero debe ser desacoplado de las dependencias externas. La definición y el ordenamiento mediante estrategias debe residir dentro del dominio puro y operar sobre entidades de dominio estables. |
| **Dependency Inversion Principle (DIP)** | Las clases de alto nivel (Casos de Uso) no deben depender de módulos de bajo nivel (Prisma). Ambos deben depender de abstracciones (interfaces del repositorio en el dominio). |

---

## 3. Puntos Críticos de Refactorización

1. **Eliminar dependencias de NestJS y Prisma en el núcleo de negocio:** Quitar los decoradores `@Injectable()` y llamadas directas a `this.prisma` de los servicios que se convertirán en Casos de Uso.
2. **Definir Interfaces (Puertos):** Crear las interfaces para la comunicación con el exterior:
   * `IPostRepository` para crear, buscar y listar posts.
   * `ICommentRepository` para gestionar comentarios.
   * `ILikeRepository` para registrar reacciones.
   * `IModerationService` para las validaciones de palabras prohibidas.
3. **Mapeo de Entidades:** Crear una entidad de dominio pura `Post` y `Comment` que no dependan del esquema directo del ORM, aislando los tipos generados de Prisma en la capa de persistencia.
4. **Trasladar Orquestación del Feed:** Crear un caso de uso específico para retornar el feed ordenado, quitándole la responsabilidad de ordenamiento al [posts.controller.ts](INFO1156-AC_06-Clean-Architecture/src/posts/posts.controller.ts).

---

## 4. Propuesta de Implementación de Clean Architecture

### Estructura de Capas
El flujo de dependencias siempre irá **desde afuera hacia adentro**, protegiendo el núcleo de negocio (Domain) de cualquier cambio tecnológico en la periferia (Infrastructure).

```mermaid
graph TD
    subgraph Infrastructure Layer (External Tools, Frameworks & Adapters)
        NestController[NestJS Controllers]
        PrismaRepo[Prisma Repositories Adapters]
        PrismaClient[Prisma Client & Database]
    end

    subgraph Application Layer (Use Cases)
        UC_Create[CreatePost Use Case]
        UC_Feed[GetFeedPosts Use Case]
        UC_Comment[AddComment Use Case]
    end

    subgraph Domain Layer (Entities & Ports)
        PostEnt[Post Entity]
        CommentEnt[Comment Entity]
        IPostRepo[IPostRepository Interface]
        ICommentRepo[ICommentRepository Interface]
        RankStrat[Ranking Strategies]
    end

    NestController --> UC_Feed
    NestController --> UC_Create
    UC_Feed --> IPostRepo
    UC_Create --> IPostRepo
    UC_Create --> PostEnt
    PrismaRepo -- Implements --> IPostRepo
    PrismaRepo --> PrismaClient
```

### Nueva Estructura de Directorios Propuesta

Se propone reorganizar el servidor bajo una estructura por capas enfocada en Clean Architecture:

```text
src/
├── domain/                      # Capa 1: Entidades del Negocio y Puertos (Interfaces)
│   ├── entities/
│   │   ├── post.entity.ts
│   │   ├── comment.entity.ts
│   │   └── like.entity.ts
│   ├── repositories/            # Puertos (Interfaces de persistencia)
│   │   ├── post-repository.interface.ts
│   │   └── comment-repository.interface.ts
│   └── strategies/              # Lógica pura de ordenamiento (Pattern Strategy)
│       └── feed-ranking.strategy.ts
│
├── application/                 # Capa 2: Casos de Uso (Lógica de Aplicación)
│   ├── use-cases/
│   │   ├── create-post.use-case.ts
│   │   ├── get-ranked-feed.use-case.ts
│   │   └── add-comment.use-case.ts
│   └── dtos/                    # DTOs de Casos de Uso (limpios del framework)
│       └── post.dto.ts
│
├── infrastructure/              # Capa 3: Adaptadores de Entrada/Salida y Configuración del Framework
│   ├── controllers/             # Adaptadores de Entrada (HTTP/Rest)
│   │   ├── posts.controller.ts
│   │   └── comments.controller.ts
│   ├── persistence/             # Adaptadores de Salida (Base de Datos / Prisma)
│   │   ├── prisma/
│   │   │   ├── prisma-post.repository.ts
│   │   │   └── prisma-comment.repository.ts
│   │   └── prisma.service.ts
│   ├── nesting/                 # Módulos y dependencias específicos de NestJS
│   │   ├── app.module.ts
│   │   └── posts.module.ts
│   └── shared/                  # Excepciones HTTP, filtros y configuraciones globales
└── main.ts                      # Bootstrap de NestJS
```

---

## 5. Ejemplos de Implementación de Código Limpio

Para ilustrar la propuesta, a continuación se muestra cómo quedarían estructurados algunos archivos clave:

### Puerto: Interfaz de Repositorio (Dominio)
En `src/domain/repositories/post-repository.interface.ts`:
```typescript
import { Post } from "../entities/post.entity";

export interface IPostRepository {
    create(post: Post): Promise<Post>;
    findAll(): Promise<Post[]>;
    findById(id: string): Promise<Post | null>;
    getFeedPosts(categoryId?: string): Promise<Post[]>;
}
```

### Caso de Uso: Obtención y Ordenamiento de Feed (Aplicación)
En `src/application/use-cases/get-ranked-feed.use-case.ts`:
```typescript
import { IPostRepository } from "../../domain/repositories/post-repository.interface";
import { FeedRankingStrategyFactory } from "../../domain/strategies/feed-ranking.strategy";
import { Post } from "../../domain/entities/post.entity";

export class GetRankedFeedUseCase {
    constructor(
        private readonly postRepository: IPostRepository,
        private readonly rankingFactory: FeedRankingStrategyFactory
    ) {}

    async execute(mode: string, categoryId?: string): Promise<Post[]> {
        const posts = await this.postRepository.getFeedPosts(categoryId);
        const strategy = this.rankingFactory.forMode(mode);
        return strategy.rank(posts);
    }
}
```

### Adaptador: Repositorio con Prisma (Infraestructura)
En `src/infrastructure/persistence/prisma/prisma-post.repository.ts`:
```typescript
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { IPostRepository } from "../../../domain/repositories/post-repository.interface";
import { Post } from "../../../domain/entities/post.entity";

@Injectable()
export class PrismaPostRepository implements IPostRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(post: Post): Promise<Post> {
        const created = await this.prisma.post.create({
            data: {
                title: post.title,
                description: post.description,
                imageUrl: post.imageUrl,
                categoryId: post.categoryId,
            }
        });
        return Post.fromDatabase(created); // Mapeo a entidad de dominio
    }

    async findAll(): Promise<Post[]> {
        const posts = await this.prisma.post.findMany({
            orderBy: { createdAt: "desc" }
        });
        return posts.map(Post.fromDatabase);
    }

    async findById(id: string): Promise<Post | null> {
        const post = await this.prisma.post.findUnique({ where: { id } });
        return post ? Post.fromDatabase(post) : null;
    }

    async getFeedPosts(categoryId?: string): Promise<Post[]> {
        const posts = await this.prisma.post.findMany({
            where: categoryId ? { categoryId } : undefined,
            include: { comments: true, likes: true }
        });
        return posts.map(Post.fromDatabase);
    }
}
```

---

## Beneficios Esperados de la Migración

1. **Testabilidad:** Podrás escribir tests unitarios rápidos para los casos de uso simulando (`mocking`) las interfaces de los repositorios sin necesidad de levantar contenedores de base de datos ni instalar NestJS en el test runner.
2. **Independencia Tecnológica:** Si en el futuro necesitas migrar a una base de datos NoSQL o de alto rendimiento para el feed (como Redis o MongoDB), solo tendrás que crear una nueva clase que implemente `IPostRepository` sin tocar una sola línea de la lógica de los casos de uso.
3. **Mantenibilidad:** El código del negocio queda encapsulado, autodocumentado y libre del ruido técnico de las dependencias externas, reduciendo el riesgo de bugs por efectos colaterales durante las modificaciones.
