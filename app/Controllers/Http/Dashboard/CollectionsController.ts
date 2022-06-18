import { DateTime } from 'luxon'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { CollectionStatus } from 'App/Enums/CollectionStatus'
import Collection from 'App/Models/Collection'

export default class CollectionsController {
    public async index({ request }: HttpContextContract) {
        const collections = await Collection.query()
            .orderBy('created_at', request.qs().order_by ?? 'desc')
            .paginate(request.qs().page ?? 1, request.qs().per_page ?? 5)

        return collections
    }

    public async show({ response, params }: HttpContextContract) {
        const collection = await Collection.find(params.id)

        if (!collection)
            return response.status(404).send({ error: 'collection.Collection_Not_Found' })

        return collection
    }

    public async create({ request, response }: HttpContextContract) {
        const collectionSchema = schema.create({
            slug: schema.string({}, [
                rules.unique({
                    table: 'collections',
                    column: 'slug',
                    where: {
                        deleted_at: null,
                    },
                    caseInsensitive: true,
                }),
            ]),
            title: schema.string(),
            description: schema.string.optional(),
            thumbnail: schema.string.optional(),
            seo_title: schema.string.optional(),
            seo_description: schema.string.optional(),
            seo_keywords: schema.string.optional(),
            status: schema.enum(Object.values(CollectionStatus)),
            published_at: schema.date.optional(),
            products: schema.array
                .optional([rules.minLength(1)])
                .members(schema.number([rules.exists({ table: 'products', column: 'id' })])),
        })

        try {
            const payload = await request.validate({
                schema: collectionSchema,
            })

            const collection = await Collection.create(payload)
            collection.related('products').attach(payload.products ?? [])

            return collection
        } catch (error) {
            return response.badRequest(error.messages)
        }
    }

    public async update({ request, response, params, i18n }: HttpContextContract) {
        const collection = await Collection.find(params.id)

        if (!collection)
            return response.notFound({
                error: i18n.formatMessage('collection.Collection_Not_Found'),
            })

        const collectionSchema = schema.create({
            slug: schema.string.optional({}, [
                rules.unique({
                    table: 'collections',
                    column: 'slug',
                    where: {
                        deleted_at: null,
                    },
                    whereNot: {
                        id: params.id,
                    },
                    caseInsensitive: true,
                }),
            ]),
            title: schema.string.optional(),
            description: schema.string.optional(),
            thumbnail: schema.string.optional(),
            status: schema.enum.optional(Object.values(CollectionStatus)),
            seo_title: schema.string.optional(),
            seo_description: schema.string.optional(),
            seo_keywords: schema.string.optional(),
            published_at: schema.date.optional(),
            products: schema.array
                .optional([rules.minLength(1)])
                .members(schema.number([rules.exists({ table: 'collections', column: 'id' })])),
        })

        try {
            const payload = await request.validate({
                schema: collectionSchema,
            })

            await collection.merge(payload).save()
            collection.related('products').sync(payload.products ?? [])

            return collection
        } catch (error) {
            return response.badRequest(error.messages)
        }
    }

    public async delete({ response, params, i18n }: HttpContextContract) {
        const collection = await Collection.find(params.id)
        if (!collection)
            return response.status(404).send({ error: 'collection.Collection_Not_Found' })

        await collection.merge({ deletedAt: DateTime.now() }).save()
        collection.related('products').detach()

        return response.status(200).send({
            message: i18n.formatMessage('common.Delete_Collection_Success', {
                id: params.id,
            }),
        })
    }
}
