import { DateTime } from 'luxon'
import Route from '@ioc:Adonis/Core/Route'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { UserRole } from 'App/Enums/UserRole'
import User from 'App/Models/User'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Mail from '@ioc:Adonis/Addons/Mail'

export default class CustomersController {
    public async index({ request }: HttpContextContract) {
        const users = await User.query()
            .where('role', UserRole.Customer)
            .paginate(request.qs().page ?? 1, request.qs().per_page ?? 5)
        return users
    }

    public async create({ request, response }: HttpContextContract) {
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
            gender: schema.enum.optional(['male', 'female'] as const),
            avatar: schema.string.optional({}, [rules.url()]),
            company: schema.string.optional({}, [rules.minLength(4), rules.maxLength(255)]),
        })

        try {
            const payload = await request.validate({ schema: userSchema })

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
        } catch (error) {
            response.badRequest(error.messages)
        }
    }

    public async show({ response, params, i18n }: HttpContextContract) {
        const user = await User.find(params.id)
        if (!user) return response.notFound({ error: i18n.formatMessage('user.User_Not_Found') })
        return user
    }

    public async update({ request, response, params, i18n }: HttpContextContract) {
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
            avatar: schema.string.optional({}, [rules.url()]),
            company: schema.string.optional({}, [rules.minLength(4), rules.maxLength(255)]),
        })

        try {
            const payload = await request.validate({ schema: userSchema })

            const updatedUser = await user.merge(payload).save()
            return updatedUser
        } catch (error) {
            response.badRequest(error.messages)
        }
    }

    public async delete({ response, params, i18n }: HttpContextContract) {
        const user = await User.find(params.id)

        if (!user)
            return response.status(404).send({ error: i18n.formatMessage('user.User_Not_Found') })

        await user.merge({ deletedAt: DateTime.now() }).save()
        return response.status(200).send({
            message: i18n.formatMessage('user.User_Deleted_Successfully'),
        })
    }
}
