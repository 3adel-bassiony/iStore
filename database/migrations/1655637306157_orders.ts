import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { OrderStatus } from 'App/Enums/OrderStatus'

export default class extends BaseSchema {
    protected tableName = 'orders'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.integer('user_id').unsigned().references('users.id')
            table.integer('address_id').unsigned().references('addresses.id')
            table.enu('status', Object.values(OrderStatus), {
                useNative: true,
                enumName: 'order_status',
                existingType: false,
            })
            table.string('notes').nullable()
            table.timestamp('created_at', { useTz: true })
            table.timestamp('updated_at', { useTz: true })
            table.timestamp('deleted_at').defaultTo(null)
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
        this.schema.raw('DROP TYPE IF EXISTS "order_status"')
    }
}
