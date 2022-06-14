import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

import { DateTime } from 'luxon'
import Product from '../../../Models/Product'
import { ProductStatus } from '../../../Enums/ProductStatus'

export default class ProductsController {
    public async index({ request }: HttpContextContract) {
        const products = await Product.query()
            .orderBy('created_at', request.qs().order_by ?? 'desc')
            .paginate(request.qs().page ?? 1, request.qs().per_page ?? 5)

        const paginationJSON = products.serialize()

        return paginationJSON
    }

    public async show({ params }: HttpContextContract) {
        const product = await Product.find(params.id)
        return product?.serialize()
    }

    public async create({ request, response }: HttpContextContract) {
        const productSchema = schema.create({
            brand_id: schema.number.optional([rules.exists({ table: 'brands', column: 'id' })]),
            slug: schema.string({}, [rules.unique({ table: 'products', column: 'slug' })]),
            title: schema.string(),
            description: schema.string.optional(),
            price: schema.number([rules.range(10, 1000000)]),
            cost_price: schema.number.optional([rules.range(10, 1000000)]),
            special_price: schema.number.optional([rules.range(10, 1000000)]),
            quantity: schema.number([rules.range(10, 1000000)]),
            thumbnail: schema.string.optional(),
            sku: schema.string.optional(),
            barcode: schema.string.optional(),
            model: schema.string.optional(),
            status: schema.enum(Object.values(ProductStatus)),
            seo_title: schema.string.optional(),
            seo_description: schema.string.optional(),
            seo_keywords: schema.string.optional(),
            published_at: schema.date.optional(),
            attachments: schema.array
                .optional([rules.minLength(1), rules.maxLength(5)])
                .members(schema.string()),
        })

        try {
            const payload = await request.validate({
                schema: productSchema,
            })

            const product = await Product.create(payload)

            return product.serialize()
        } catch (error) {
            return response.badRequest(error.messages)
        }
    }

    public async update({ request, response, params, i18n }: HttpContextContract) {
        const product = await Product.find(params.id)

        if (!product)
            return response.notFound({ error: i18n.formatMessage('product.Product_Not_Found') })

        const productSchema = schema.create({
            brand_id: schema.number.optional([rules.exists({ table: 'brands', column: 'id' })]),
            slug: schema.string.optional({}, [rules.unique({ table: 'products', column: 'slug' })]),
            title: schema.string.optional(),
            description: schema.string.optional(),
            price: schema.number([rules.range(10, 1000000)]),
            cost_price: schema.number.optional([rules.range(10, 1000000)]),
            special_price: schema.number.optional([rules.range(10, 1000000)]),
            quantity: schema.number.optional([rules.range(10, 1000000)]),
            thumbnail: schema.string.optional(),
            sku: schema.string.optional(),
            barcode: schema.string.optional(),
            model: schema.string.optional(),
            status: schema.enum.optional(Object.values(ProductStatus)),
            seo_title: schema.string.optional(),
            seo_description: schema.string.optional(),
            seo_keywords: schema.string.optional(),
            published_at: schema.date.optional(),
        })

        try {
            const payload = await request.validate({
                schema: productSchema,
            })

            await product.merge(payload).save()

            return product
        } catch (error) {
            return response.badRequest(error.messages)
        }
    }

    public async delete({ response, params, i18n }: HttpContextContract) {
        const product = await Product.find(params.id)
        if (!product) return response.status(404).send({ error: 'product.Product_Not_Found' })

        await product.merge({ deletedAt: DateTime.now() }).save()
        return response.status(200).send({
            message: i18n.formatMessage('common.Delete_Product_Success', {
                id: params.id,
            }),
        })
    }
}
