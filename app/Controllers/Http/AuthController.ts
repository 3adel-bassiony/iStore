import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Route from '@ioc:Adonis/Core/Route'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'

export default class AuthController {
    public async register({ request, response, auth }: HttpContextContract) {
        const userSchema = schema.create({
            name: schema.string(),
            username: schema.string({}, [
                rules.unique({ table: 'users', column: 'username', caseInsensitive: true }),
            ]),
            email: schema.string({}, [
                rules.unique({ table: 'users', column: 'email', caseInsensitive: true }),
            ]),
            phone: schema.string({}, [rules.unique({ table: 'user', column: 'phone' })]),
            password: schema.string({}, [rules.minLength(8)]),
            gender: schema.enum.optional(['male', 'female'] as const),
            company: schema.string.optional({}, [rules.minLength(20)]),
            avatar: schema.string.optional({}, [rules.minLength(20)]),
        })

        try {
            const payload = await request.validate({ schema: userSchema })

            const user = await User.create(payload)

            const token = await auth.use('api').generate(user, {
                expiresIn: '7days',
                name: 'Access Token',
            })

            const signedUrl = await Route.makeSignedUrl('verifyEmail', {
                email: request.input('email'),
                expiresIn: '60m',
            })

            console.log(signedUrl)

            // await Mail.sendLater((message) => {
            //     message
            //         .from('info@example.com')
            //         .to(email)
            //         .subject('Verify Your Email')
            //         .htmlView('emails/welcome', {
            //             url: `${process.env.APP_URL}${signedUrl}`,
            //         })
            // })

            // Return user object
            return {
                ...user,
                token: token.toJSON(),
            }
        } catch (error) {
            response.badRequest(error.messages)
        }
    }

    public async login({ auth, request, response, i18n }: HttpContextContract) {
        const uid = request.input('uid')
        const password = request.input('password')

        const user = await User.query().where('email', uid).orWhere('username', uid).first()

        if (!user)
            return response.badRequest({
                error: i18n.formatMessage('auth.Email_Or_Username_Not_Exist'),
            })

        try {
            const token = await auth.use('api').attempt(uid, password, {
                expiresIn: '7days',
                name: 'Access Token',
            })
            return {
                ...user.$original,
                token: token.toJSON(),
            }
        } catch {
            return response.badRequest({ error: i18n.formatMessage('auth.Invalid_Credentials') })
        }
    }

    public async logout({ auth }: HttpContextContract) {
        await auth.use('api').revoke()
        return {
            revoked: true,
        }
    }

    public async forgotPassword({ request, response, i18n }: HttpContextContract) {
        const email = request.input('email')

        const user = await User.query().where('email', email).firstOrFail()

        if (!user) return response.badRequest({ error: i18n.formatMessage('auth.Email_Not_Exist') })

        // const signedUrl = await Route.makeSignedUrl('resetPassword', { email, expiresIn: '60m' })

        // await Mail.sendLater((message) => {
        //     message
        //         .from('info@example.com')
        //         .to(email)
        //         .subject('Reset Password')
        //         .htmlView('emails/reset_password', {
        //             url: `${process.env.APP_URL}${signedUrl}`,
        //         })
        // })

        return response.status(200).send({
            message: i18n.formatMessage('auth.Reset_Password_Email_Sent_Successfully'),
        })
    }

    public async resetPassword({ request, response, params, i18n }: HttpContextContract) {
        if (request.hasValidSignature()) {
            const user = await User.findBy('email', params.email)

            if (!user)
                return response.notFound({ error: i18n.formatMessage('auth.Email_Not_Exist') })

            user.password = request.input('new_password')
            user.save()
            return response
                .status(200)
                .send({ message: i18n.formatMessage('auth.Password_Changed_Successfully') })
        }

        return response.notFound({ error: i18n.formatMessage('auth.Invalid_Signature') })
    }

    public async changePassword({ request, response, i18n }: HttpContextContract) {
        const email = request.input('email')
        const currentPassword = request.input('current_password')
        const newPassword = request.input('new_password')
        const user = await User.query().where('email', email).firstOrFail()
        const isCurrentPasswordCorrect = await Hash.verify(user.password, currentPassword)

        try {
            if (isCurrentPasswordCorrect) {
                user.password = newPassword
                user.save()
                return response
                    .status(200)
                    .send({ message: i18n.formatMessage('auth.Password_Changed_Successfully') })
            } else {
                return response.badRequest({
                    error: i18n.formatMessage('auth.Current_Password_Wrong'),
                })
            }
        } catch (error) {
            return response.badRequest({ error: i18n.formatMessage('auth.Email_Not_Exist') })
        }
    }

    public async verifyEmail({ request, response, params, i18n }) {
        if (request.hasValidSignature()) {
            const user = await User.findBy('email', params.email)

            if (!user)
                return response.notFound({ error: i18n.formatMessage('auth.Email_Not_Exist') })

            user.isVerified = true
            user.save()

            return response.status(200).send({ message: i18n.formatMessage('auth.Email_Verified') })
        }

        return response.notFound({ error: i18n.formatMessage('auth.Invalid_Signature') })
    }
}
