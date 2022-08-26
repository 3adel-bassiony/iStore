import { DateTime } from 'luxon'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Discount from 'App/Models/Discount'
import { DiscountType } from 'App/Enums/DiscountType'

export default class DiscountsController {
    public async index({ request }: HttpContextContract) {
        const discounts = await Discount.query()
            .orderBy('created_at', request.qs().order_by ?? 'desc')
            .paginate(request.qs().page ?? 1, request.qs().per_page ?? 5)

        return discounts
    }

    public async show({ response, params, i18n }) {
        const discount = Discount.find(params.id)
        if (!discount)
            return response.notFound({ error: i18n.formatMessage('discounts.Discount_Not_Found') })
        return discount
    }

    public async create({ request, response }: HttpContextContract) {
        const discountSchema = schema.create({
            slug: schema.string({}, [
                rules.unique({
                    table: 'discounts',
                    column: 'code',
                    where: {
                        deleted_at: null,
                    },
                    caseInsensitive: true,
                }),
            ]),
            type: schema.enum(Object.values(DiscountType)),
            value: schema.number([rules.range(0, 1000000)]),
            quantity: schema.number([rules.range(0, 1000000)]),
            has_minimum_amount: schema.boolean(),
            minimum_amount: schema.number.optional([rules.range(0, 1000000)]),
            is_active: schema.boolean(),
            start_at: schema.date.optional(),
            end_at: schema.date.optional(),
        })

        try {
            const payload = await request.validate({
                schema: discountSchema,
            })

            const discount = await Discount.create(payload)

            return discount
        } catch (error) {
            return response.badRequest(error.messages)
        }
    }

    public async delete({ response, params, i18n }: HttpContextContract) {
        const discount = await Discount.find(params.id)
        if (!discount)
            return response
                .status(404)
                .send({ error: i18n.formatMessage('discount.Discount_Not_Found') })

        await discount.merge({ deletedAt: DateTime.now() }).save()
        return response.status(200).send({
            message: i18n.formatMessage('discount.Discount_Deleted_Successfully', {
                id: params.id,
            }),
        })
    }
}
