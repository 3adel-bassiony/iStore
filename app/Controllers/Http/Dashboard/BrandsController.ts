import { DateTime } from 'luxon'

import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Brand from 'App/Models/Brand'
import { BrandStatus } from 'App/Enums/BrandStatus'

export default class BrandsController {
    public async index({ request }: HttpContextContract) {
        const brands = await Brand.query()
            .orderBy('created_at', request.qs().order_by ?? 'desc')
            .paginate(request.qs().page ?? 1, request.qs().per_page ?? 5)

        return brands
    }

    public async show({ response, params, i18n }) {
        const brand = Brand.find(params.id)
        if (!brand)
            return response.notFound({ error: i18n.formatMessage('brands.Brand_Not_Found') })
        return brand
    }

    public async create({ request, response }: HttpContextContract) {
        const brandSchema = schema.create({
            slug: schema.string({}, [rules.unique({ table: 'brands', column: 'slug' })]),
            name: schema.string(),
            description: schema.string.optional(),
            thumbnail: schema.string.optional(),
            status: schema.enum(Object.values(BrandStatus)),
            seo_title: schema.string.optional(),
            seo_description: schema.string.optional(),
            seo_keywords: schema.string.optional(),
        })

        try {
            const payload = await request.validate({
                schema: brandSchema,
            })

            const brand = await Brand.create(payload)

            return brand
        } catch (error) {
            return response.badRequest(error.messages)
        }
    }

    public async update({ request, response, params, i18n }: HttpContextContract) {
        const brand = await Brand.find(params.id)

        if (!brand) return response.notFound({ error: i18n.formatMessage('brand.Brand_Not_Found') })

        const brandSchema = schema.create({
            slug: schema.string.optional({}, [rules.unique({ table: 'brands', column: 'slug' })]),
            name: schema.string.optional(),
            description: schema.string.optional(),
            thumbnail: schema.string.optional(),
            status: schema.enum.optional(Object.values(BrandStatus)),
            seo_title: schema.string.optional(),
            seo_description: schema.string.optional(),
            seo_keywords: schema.string.optional(),
        })

        try {
            const payload = await request.validate({
                schema: brandSchema,
            })

            await brand.merge(payload).save()

            return brand
        } catch (error) {
            return response.badRequest(error.messages)
        }
    }

    public async delete({ response, params, i18n }: HttpContextContract) {
        const brand = await Brand.find(params.id)
        if (!brand)
            return response.status(404).send({ error: i18n.formatMessage('brand.Brand_Not_Found') })

        await brand.merge({ deletedAt: DateTime.now() }).save()
        return response.status(200).send({
            message: i18n.formatMessage('brand.Brand_Deleted_Successfully', {
                id: params.id,
            }),
        })
    }
}
