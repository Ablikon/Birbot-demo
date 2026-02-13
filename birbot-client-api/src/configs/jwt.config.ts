import { JwtModuleOptions } from '@nestjs/jwt'

export const getJWTConfig = async (): Promise<JwtModuleOptions> => {
    return {
        secret: process.env.JWT_SECRET || '',
    }
}
