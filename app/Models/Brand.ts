import { DateTime } from 'luxon'
import {
    BaseModel,
    column,
    beforeFind,
    beforeFetch,
    ModelQueryBuilderContract,
    beforePaginate,
    hasMany,
    HasMany,
} from '@ioc:Adonis/Lucid/Orm'
import { BrandStatus } from 'App/Enums/BrandStatus'
import Product from './Product'

export default class Brand extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public slug: string

    @column()
    public name: string

    @column()
    public description: string

    @column()
    public thumbnail: string | null

    @column()
    public status: BrandStatus

    @column()
    public seoTitle: string

    @column()
    public seoDescription: string

    @column()
    public seoKeywords: string

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    @column.dateTime({ serializeAs: null })
    public deletedAt: DateTime

    @hasMany(() => Product)
    public products: HasMany<typeof Product>

    @beforeFind()
    @beforeFetch()
    public static ignoreDeleted = (query: ModelQueryBuilderContract<typeof Brand>) => {
        query.whereNull('deleted_at')
    }

    @beforePaginate()
    public static updatePagination([countQuery, query]: [
        ModelQueryBuilderContract<typeof Brand>,
        ModelQueryBuilderContract<typeof Brand>
    ]) {
        query.whereNull('deleted_at')
        countQuery.whereNull('deleted_at')
    }
}
