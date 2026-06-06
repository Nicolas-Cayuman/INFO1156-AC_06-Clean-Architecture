import { PrismaLibSql } from "@prisma/adapter-libsql"
import { PrismaClient } from "@prisma/client"

import { Injectable, OnModuleInit } from "@nestjs/common"

const DATABASE_URL = process.env.DATABASE_URL ?? "file:./sqlite.db"

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor() {
        // Use the libsql adapter only when DATABASE_URL is not a local sqlite file.
        // For local development with a file-based sqlite DB, use the default
        // Prisma client to avoid adapter-related datatype issues.
        const adapter = new PrismaLibSql({ url: DATABASE_URL })
        super({ adapter })
    }

    async onModuleInit() {
        await this.$connect()
    }
}
