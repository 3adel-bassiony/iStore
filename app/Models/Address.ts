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
    hasMany,
    HasMany,
} from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import Order from './Order'

export default class Address extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public userId: number

    @column()
    public street: string

    @column()
    public building: string

    @column()
    public floor: number

    @column()
    public apartment: string

    @column()
    public district: string

    @column()
    public government: string

    @column()
    public isCompany: boolean

    @column()
    public company: string

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    @column.dateTime({ serializeAs: null })
    public deletedAt: DateTime

    @belongsTo(() => User)
    public user: BelongsTo<typeof User>

    @hasMany(() => Order)
    public orders: HasMany<typeof Order>

    @beforeFind()
    @beforeFetch()
    public static ignoreDeleted = (query: ModelQueryBuilderContract<typeof Address>) => {
        query.whereNull('deleted_at')
    }

    @beforePaginate()
    public static updatePagination([countQuery, query]: [
        ModelQueryBuilderContract<typeof Address>,
        ModelQueryBuilderContract<typeof Address>
    ]) {
        query.whereNull('deleted_at')
        countQuery.whereNull('deleted_at')
    }
}
