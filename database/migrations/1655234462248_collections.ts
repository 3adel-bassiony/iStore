import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { CollectionStatus } from 'App/Enums/CollectionStatus'

export default class extends BaseSchema {
    protected tableName = 'collections'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.string('slug')
            table.string('title')
            table.text('description')
            table.string('thumbnail')
            table.string('seo_title')
            table.string('seo_description')
            table.string('seo_keywords')
            table.enu('status', Object.values(CollectionStatus), {
                useNative: true,
                enumName: 'collection_status',
                existingType: false,
            })
            table.timestamp('published_at', { useTz: true })
            table.timestamp('created_at', { useTz: true }).notNullable()
            table.timestamp('updated_at', { useTz: true }).notNullable()
            table.timestamp('deleted_at').defaultTo(null)
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
        this.schema.raw('DROP TYPE IF EXISTS "collection_status"')
    }
}
