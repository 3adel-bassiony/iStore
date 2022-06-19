import { schema, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Address from 'App/Models/Address'
import { DateTime } from 'luxon'

export default class AddressesController {
    public async show({ response, params, i18n }: HttpContextContract) {
        const address = await Address.find(params.id)
        if (!address)
            return response.notFound({ error: i18n.formatMessage('addresses.Address_Not_Found') })
        return address
    }

    public async create({ request, response }: HttpContextContract) {
        const addressSchema = schema.create({
            user_id: schema.number([rules.exists({ table: 'users', column: 'id' })]),
            street: schema.string({}, [rules.minLength(4), rules.maxLength(255)]),
            building: schema.string({}, [rules.minLength(1), rules.maxLength(255)]),
            floor: schema.number(),
            apartment: schema.string({}, [rules.minLength(1), rules.maxLength(255)]),
            district: schema.string({}, [rules.minLength(1), rules.maxLength(255)]),
            government: schema.string({}, [rules.minLength(1), rules.maxLength(255)]),
            is_company: schema.boolean.optional(),
            company: schema.string.optional({}, [
                rules.requiredIfExists('is_company'),
                rules.minLength(1),
                rules.maxLength(255),
            ]),
        })

        try {
            const payload = await request.validate({
                schema: addressSchema,
            })

            const address = await Address.create(payload)

            return address
        } catch (error) {
            return response.badRequest(error.messages)
        }
    }

    public async update({ request, response, params, i18n }: HttpContextContract) {
        const address = await Address.find(params.id)

        if (!address)
            return response.notFound({ error: i18n.formatMessage('addresses.Address_Not_Found') })

        const addressSchema = schema.create({
            street: schema.string({}, [rules.minLength(4), rules.maxLength(255)]),
            building: schema.string({}, [rules.minLength(1), rules.maxLength(255)]),
            floor: schema.number(),
            apartment: schema.string({}, [rules.minLength(1), rules.maxLength(255)]),
            district: schema.string({}, [rules.minLength(1), rules.maxLength(255)]),
            government: schema.string({}, [rules.minLength(1), rules.maxLength(255)]),
            is_company: schema.boolean.optional(),
            company: schema.string.optional({}, [
                rules.requiredIfExists('is_company'),
                rules.minLength(1),
                rules.maxLength(255),
            ]),
        })

        try {
            const payload = await request.validate({
                schema: addressSchema,
            })

            await address.merge(payload).save()

            return address
        } catch (error) {
            return response.badRequest(error.messages)
        }
    }

    public async delete({ response, params, i18n }: HttpContextContract) {
        const address = await Address.find(params.id)

        if (!address)
            return response
                .status(404)
                .send({ error: i18n.formatMessage('addresses.Address_Not_Found') })

        await address.merge({ deletedAt: DateTime.now() }).save()
        return response.status(200).send({
            message: i18n.formatMessage('addresses.Address_Deleted_Successfully'),
        })
    }
}
