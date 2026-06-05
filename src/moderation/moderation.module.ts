import { Module } from "@nestjs/common"
import { ModerationController } from "@/moderation/moderation.controller"
import { ModerationService } from "@/moderation/moderation.service"
import { I_PROHIBITED_WORD_REPOSITORY } from "./moderation.repository"
import { PrismaModerationRepository } from "./prisma-moderation.repository"

@Module({
    controllers: [ModerationController],
    providers: [
        ModerationService,
        {
            provide: I_PROHIBITED_WORD_REPOSITORY,
            useClass: PrismaModerationRepository,
        },
    ],
    exports: [ModerationService],
})
export class ModerationModule {}
