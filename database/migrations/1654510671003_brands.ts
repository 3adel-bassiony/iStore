import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { BrandStatus } from 'App/Enums/BrandStatus'

export default class extends BaseSchema {
    protected tableName = 'brands'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.string('slug')
            table.string('name')
            table.text('description')
            table.string('thumbnail')
            table.string('seo_title')
            table.string('seo_description')
            table.string('seo_keywords')
            table.enu('status', Object.values(BrandStatus), {
                useNative: true,
                enumName: 'brand_status',
                existingType: false,
            })
            table.timestamp('created_at', { useTz: true })
            table.timestamp('updated_at', { useTz: true })
            table.timestamp('deleted_at').defaultTo(null)
            table.unique(['slug'])
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
