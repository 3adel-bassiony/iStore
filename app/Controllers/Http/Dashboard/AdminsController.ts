import { DateTime } from 'luxon'
import Route from '@ioc:Adonis/Core/Route'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { UserRole } from 'App/Enums/UserRole'
import User from 'App/Models/User'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Mail from '@ioc:Adonis/Addons/Mail'

export default class AdminsController {
    public async index({ request }: HttpContextContract) {
        const users = await User.query()
            .whereNot('role', UserRole.Customer)
            .paginate(request.qs().page ?? 1, request.qs().per_page ?? 5)
        return users
    }

    public async create({ request, response, auth, i18n }: HttpContextContract) {
        const userSchema = schema.create({
            name: schema.string(),
            username: schema.string({}, [
                rules.unique({ table: 'users', column: 'username', caseInsensitive: true }),
            ]),
            email: schema.string({}, [
                rules.email(),
                rules.unique({ table: 'users', column: 'email', caseInsensitive: true }),
            ]),
            phone: schema.string({}, [
                rules.unique({ table: 'users', column: 'phone' }),
                rules.minLength(11),
                rules.maxLength(14),
            ]),
            password: schema.string({}, [rules.minLength(8)]),
            gender: schema.enum(['male', 'female'] as const),
            role: schema.enum(Object.values(UserRole)),
            avatar: schema.string.optional({}, [rules.url()]),
        })

        try {
            const payload = await request.validate({ schema: userSchema })

            if (auth.user?.role === UserRole.Owner || auth.user?.role === UserRole.Admin) {
                const user = await User.create(payload)

                const signedUrl = await Route.makeSignedUrl('verifyEmail', {
                    email: request.input('email').toLowerCase(),
                    expiresIn: '60m',
                })

                await Mail.sendLater((message) => {
                    message
                        .from('info@example.com')
                        .to(request.input('email'))
                        .subject('Verify Your Email')
                        .htmlView('emails/verify_email', {
                            url: `${process.env.APP_URL}${signedUrl}`,
                        })
                })
                return user
            }

            return response.badRequest({
                error: i18n.formatMessage('user.User_Permission_Denied'),
            })
        } catch (error) {
            response.badRequest(error.messages)
        }
    }

    public async show({ response, params, i18n }: HttpContextContract) {
        const user = await User.find(params.id)
        if (!user) return response.notFound({ error: i18n.formatMessage('user.User_Not_Found') })
        return user
    }

    public async update({ request, response, auth, params, i18n }: HttpContextContract) {
        const user = await User.find(params.id)

        if (!user)
            return response.status(404).send({ error: i18n.formatMessage('user.User_Not_Found') })

        const userSchema = schema.create({
            name: schema.string.optional(),
            username: schema.string.optional({}, [
                rules.unique({
                    table: 'users',
                    column: 'username',
                    whereNot: {
                        id: params.id,
                    },
                    caseInsensitive: true,
                }),
            ]),
            email: schema.string.optional({}, [
                rules.email(),
                rules.unique({
                    table: 'users',
                    column: 'email',
                    whereNot: {
                        id: params.id,
                    },
                    caseInsensitive: true,
                }),
            ]),
            phone: schema.string.optional({}, [
                rules.unique({
                    table: 'users',
                    column: 'phone',
                    whereNot: {
                        id: params.id,
                    },
                }),
            ]),
            gender: schema.enum.optional(['male', 'female'] as const),
            role: schema.enum.optional(Object.values(UserRole)),
            avatar: schema.string.optional({}, [rules.url()]),
        })

        try {
            const payload = await request.validate({ schema: userSchema })

            if (
                auth.user?.role === UserRole.Owner ||
                (auth.user?.role === UserRole.Admin && user.role !== UserRole.Owner)
            ) {
                const updatedUser = await user.merge(payload).save()
                return updatedUser
            }

            return response.badRequest({
                error: i18n.formatMessage('user.User_Permission_Denied'),
            })
        } catch (error) {
            response.badRequest(error.messages)
        }
    }

    public async delete({ response, params, auth, i18n }: HttpContextContract) {
        console.log(auth.user?.role)
        const user = await User.find(params.id)
        const ownersCount = await User.query().count('role', UserRole.Owner)

        if (!user)
            return response.status(404).send({ error: i18n.formatMessage('user.User_Not_Found') })

        if (
            (auth.user?.role === UserRole.Owner || auth.user?.role === UserRole.Admin) &&
            user.role !== UserRole.Owner &&
            ownersCount.length > 0
        ) {
            await user.merge({ deletedAt: DateTime.now() }).save()
            return response.status(200).send({
                message: i18n.formatMessage('user.User_Deleted_Successfully'),
            })
        }

        return response.badRequest({
            message: i18n.formatMessage('user.User_Permission_Denied'),
        })
    }
}
