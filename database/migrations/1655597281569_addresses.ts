import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'addresses'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table
                .integer('user_id')
                .unsigned()
                .references('id')
                .inTable('users')
                .onDelete('CASCADE')
            table.string('street')
            table.string('building')
            table.integer('floor')
            table.string('apartment')
            table.string('district')
            table.string('government')
            table.boolean('is_company')
            table.string('company')
            table.timestamp('created_at', { useTz: true })
            table.timestamp('updated_at', { useTz: true })
            table.timestamp('deleted_at').defaultTo(null)
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
