import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { DiscountType } from 'App/Enums/DiscountType'

export default class extends BaseSchema {
    protected tableName = 'discounts'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.string('code').unique()
            table.enu('type', Object.values(DiscountType), {
                useNative: true,
                enumName: 'discount_type',
                existingType: false,
            })
            table.double('value')
            table.integer('quantity')
            table.boolean('has_minimum_amount')
            table.integer('minimum_amount').nullable()
            table.boolean('is_active')
            table.timestamp('start_at', { useTz: true })
            table.timestamp('end_at', { useTz: true }).defaultTo(null)
            table.timestamp('created_at', { useTz: true })
            table.timestamp('updated_at', { useTz: true })
            table.timestamp('deleted_at', { useTz: true }).defaultTo(null)
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
        this.schema.raw('DROP TYPE IF EXISTS "discount_type"')
    }
}
