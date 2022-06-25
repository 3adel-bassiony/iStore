import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Order from 'App/Models/Order'
import { DateTime } from 'luxon'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Product from 'App/Models/Product'
import { OrderStatus } from 'App/Enums/OrderStatus'

export default class OrdersController {
    public async index({ request }: HttpContextContract) {
        const orders = await Order.query()
            .preload('products')
            .paginate(request.qs().page ?? 1, request.qs().per_page ?? 10)

        return {
            meta: orders.getMeta(),
            data: orders.all().map((order) => ({
                id: order.id,
                user: order.user,
                address: order.address,
                created_at: order.createdAt,
                notes: order.notes,
                status: order.status,
                products: order?.products.map((product) => ({
                    id: product.id,
                    title: product.title,
                    thumbnail: product.thumbnail,
                    quantity: product.$extras.pivot_quantity,
                    price: product.$extras.pivot_price,
                })),
            })),
        }
    }

    public async show({ response, params, i18n }) {
        const order = await Order.query()
            .where('id', params.id)
            .preload('user')
            .preload('address')
            .preload('products')
            .first()

        if (!order)
            return response
                .status(404)
                .send({ error: i18n.formatMessage('orders.Order_Not_Found') })

        return {
            id: order.id,
            user: order.user,
            address: order.address,
            created_at: order.createdAt,
            notes: order.notes,
            status: order.status,
            products: order?.products.map((product) => ({
                id: product.id,
                title: product.title,
                thumbnail: product.thumbnail,
                quantity: product.$extras.pivot_quantity,
                price: product.$extras.pivot_price,
            })),
        }
    }

    public async create({ request, response, i18n }: HttpContextContract) {
        const orderSchema = schema.create({
            user_id: schema.number([rules.exists({ table: 'users', column: 'id' })]),
            address_id: schema.number([rules.exists({ table: 'addresses', column: 'id' })]),
            products: schema.array([rules.minLength(1)]).members(
                schema.object().members({
                    id: schema.number([rules.exists({ table: 'products', column: 'id' })]),
                    quantity: schema.number([rules.hasValidProductQuantity()]),
                })
            ),
            notes: schema.string.optional(),
        })

        let payload

        try {
            payload = await request.validate({
                schema: orderSchema,
            })
        } catch (error) {
            response.status(422).send(error.messages)
        }

        // create the order
        const order = await Order.create({
            userId: payload.user_id,
            addressId: payload.address_id,
            notes: payload.notes,
            status: OrderStatus.Active,
        })

        // Decrease the product quantity and link the products to order
        for await (const product of request.input('products')) {
            const currentProduct = await Product.find(product.id)

            if (!currentProduct)
                return response.badRequest({
                    error: i18n.formatMessage('order.Cant_Create_Order'),
                })

            currentProduct.merge({ quantity: currentProduct.quantity - product.quantity }).save()

            order.related('products').attach({
                [product.id]: {
                    quantity: product.quantity,
                    price: currentProduct.price,
                },
            })
        }

        await order.load('products')

        return {
            id: order.id,
            user: order.user,
            address: order.address,
            created_at: order.createdAt,
            notes: order.notes,
            status: order.status,
            products: order?.products.map((product) => ({
                id: product.id,
                title: product.title,
                thumbnail: product.thumbnail,
                quantity: product.$extras.pivot_quantity,
                price: product.$extras.pivot_price,
            })),
        }
    }

    public async delete({ response, params, i18n }: HttpContextContract) {
        const order = await Order.find(params.id)
        if (!order)
            return response
                .status(404)
                .send({ error: i18n.formatMessage('orders.Order_Not_Found') })

        await order.merge({ deletedAt: DateTime.now() }).save()
        // order.related('products').detach()

        return response.status(200).send({
            message: i18n.formatMessage('orders.Order_Deleted_Successfully', {
                id: params.id,
            }),
        })
    }
}
