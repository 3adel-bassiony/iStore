import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { UserRole } from 'App/Enums/UserRole'

export default class AdminRole {
    public async handle(
        { response, auth, i18n }: HttpContextContract,
        next: () => Promise<void>,
        roles?: UserRole[]
    ) {
        if (!roles?.includes(auth.user!.role)) {
            response.unauthorized({ error: i18n.formatMessage('admin.Prmission_Denied') })
            return
        }

        await next()
    }
}
