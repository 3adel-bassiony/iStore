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
    beforeSave,
} from '@ioc:Adonis/Lucid/Orm'
import { ProductStatus } from 'App/Enums/ProductStatus'
import Brand from './Brand'

export default class Product extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public slug: string

    @column()
    public title: string

    @column()
    public description: string

    @column()
    public price: number

    @column()
    public cost_price: number

    @column()
    public special_price: number

    @column()
    public thumbnail: string | null

    @column()
    public sku: string

    @column()
    public barcode: string

    @column()
    public quantity: number

    @column()
    public model: string

    @column()
    public status: ProductStatus

    @column({
        serialize: (value: string | null) => {
            return !Array.isArray(value) ? JSON.parse(value ?? '[]') : value
        },
    })
    public attachments: string[] | string

    @column()
    public seoTitle: string

    @column()
    public seoDescription: string

    @column()
    public seoKeywords: string

    @column.dateTime({ autoCreate: true })
    public publishedAt: DateTime

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    @column.dateTime({ serializeAs: null })
    public deletedAt: DateTime

    @belongsTo(() => Brand)
    public brand: BelongsTo<typeof Brand>

    @beforeFind()
    @beforeFetch()
    public static ignoreDeleted = (query: ModelQueryBuilderContract<typeof Product>) => {
        query.whereNull('deleted_at')
    }

    @beforePaginate()
    public static updatePagination([countQuery, query]: [
        ModelQueryBuilderContract<typeof Product>,
        ModelQueryBuilderContract<typeof Product>
    ]) {
        query.whereNull('deleted_at')
        countQuery.whereNull('deleted_at')
    }

    @beforeSave()
    public static async stringifyAttachments(product: Product) {
        product.attachments = await JSON.stringify(product.attachments)
    }
}
