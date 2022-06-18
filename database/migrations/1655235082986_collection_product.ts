import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'collection_product'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table
                .integer('collection_id')
                .unsigned()
                .references('collections.id')
                .onDelete('CASCADE')
                .notNullable()
            table
                .integer('product_id')
                .unsigned()
                .references('products.id')
                .onDelete('CASCADE')
                .notNullable()
            table.unique(['collection_id', 'product_id'])
            table.timestamp('created_at', { useTz: true })
            table.timestamp('updated_at', { useTz: true })
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
