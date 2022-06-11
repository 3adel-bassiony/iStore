import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { ProductStatus } from 'App/Enums/ProductStatus'

export default class extends BaseSchema {
    protected tableName = 'products'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.integer('brand_id').unsigned().references('brands.id')
            table.string('slug')
            table.string('title')
            table.text('description')
            table.double('price')
            table.double('cost_price')
            table.double('special_price')
            table.string('thumbnail')
            table.string('sku')
            table.string('barcode')
            table.integer('quantity')
            table.string('model')
            table.enu('status', Object.values(ProductStatus), {
                useNative: true,
                enumName: 'product_status',
                existingType: false,
            })
            table.jsonb('attachments')
            table.string('seo_title')
            table.string('seo_description')
            table.string('seo_keywords')
            table.timestamp('published_at', { useTz: true })
            table.timestamp('created_at', { useTz: true })
            table.timestamp('updated_at', { useTz: true })
            table.timestamp('deleted_at').defaultTo(null)
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
