import { DateTime } from 'luxon'
import {
    BaseModel,
    column,
    beforeFind,
    beforeFetch,
    ModelQueryBuilderContract,
    beforePaginate,
    belongsTo,
    BelongsTo,
    manyToMany,
    ManyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import Address from './Address'
import Product from './Product'
import { OrderStatus } from 'App/Enums/OrderStatus'
import OrderDetail from './OrderDetail'

export default class Order extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public userId: number

    @column()
    public addressId: number

    @column()
    public notes: string

    @column()
    public status: OrderStatus

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    @column.dateTime({ serializeAs: null })
    public deletedAt: DateTime

    @belongsTo(() => User)
    public user: BelongsTo<typeof User>

    @belongsTo(() => Address)
    public address: BelongsTo<typeof Address>

    @manyToMany(() => Product, {
        pivotTable: 'order_products',
        pivotColumns: ['quantity', 'price'],
        pivotTimestamps: true,
    })
    public products: ManyToMany<typeof Product>

    @beforeFind()
    @beforeFetch()
    public static ignoreDeleted = (query: ModelQueryBuilderContract<typeof Order>) => {
        query.whereNull('deleted_at')
    }

    @beforePaginate()
    public static updatePagination([countQuery, query]: [
        ModelQueryBuilderContract<typeof Order>,
        ModelQueryBuilderContract<typeof Order>
    ]) {
        query.whereNull('deleted_at')
        countQuery.whereNull('deleted_at')
    }
}
