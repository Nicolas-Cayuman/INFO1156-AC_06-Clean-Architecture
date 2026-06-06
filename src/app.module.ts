import { Module } from "@nestjs/common"
import { CategoriesModule } from "@/categories/categories.module"
import { CommentsModule } from "@/comments/comments.module"
import { LikesModule } from "@/likes/likes.module"
import { ModerationModule } from "@/moderation/moderation.module"
import { PostsModule } from "@/posts/posts.module"
import { DomainErrorFilter } from "@/shared/domain-error.filter"
import { PrismaModule } from "@/shared/prisma.module"
import { APP_FILTER } from "@nestjs/core"

@Module({
    imports: [
        PrismaModule,
        CategoriesModule,
        PostsModule,
        CommentsModule,
        LikesModule,
        ModerationModule,
    ],
    providers: [
        {
            provide: APP_FILTER,
            useClass: DomainErrorFilter,
        },
    ],
})
export class AppModule {}
