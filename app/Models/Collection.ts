import { DateTime } from 'luxon'
import {
    BaseModel,
    column,
    computed,
    beforeFind,
    beforeFetch,
    ModelQueryBuilderContract,
    beforePaginate,
    manyToMany,
    ManyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import { CollectionStatus } from 'App/Enums/CollectionStatus'
import Product from './Product'

export default class Collection extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public slug: string

    @column()
    public title: string

    @column()
    public description: string

    @column()
    public thumbnail: string | null

    @column()
    public seoTitle: string

    @column()
    public seoDescription: string

    @column()
    public seoKeywords: string

    @column()
    public status: CollectionStatus

    @column.dateTime({ autoCreate: true })
    public publishedAt: DateTime

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    @column.dateTime({ serializeAs: null })
    public deletedAt: DateTime

    @computed()
    public get products_count(): number {
        return Number(this.$extras.products_count ?? 0)
    }

    @beforeFind()
    @beforeFetch()
    public static ignoreDeleted = (query: ModelQueryBuilderContract<typeof Collection>) => {
        query.whereNull('deleted_at').withCount('products', (query) => query.as('products_count'))
    }

    @beforePaginate()
    public static updatePagination([countQuery, query]: [
        ModelQueryBuilderContract<typeof Collection>,
        ModelQueryBuilderContract<typeof Collection>
    ]) {
        query.whereNull('deleted_at')
        countQuery.whereNull('deleted_at')
    }

    @manyToMany(() => Product)
    public products: ManyToMany<typeof Product>
}
