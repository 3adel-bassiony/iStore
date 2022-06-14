import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { UserRole } from 'App/Enums/UserRole'

export default class UsersSchema extends BaseSchema {
    protected tableName = 'users'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id').primary()
            table.string('name', 255).notNullable()
            table.string('username', 255).notNullable().unique()
            table.string('email', 255).notNullable().unique()
            table.string('phone', 255).nullable().unique()
            table.string('password', 180).notNullable()
            table.string('remember_me_token').nullable()
            table.string('avatar', 180).nullable()
            table.string('gender', 6).nullable()
            table.string('company', 6).nullable()
            table.boolean('is_verified').nullable()
            table.boolean('is_active').nullable()
            table
                .enu('role', Object.values(UserRole), {
                    useNative: true,
                    enumName: 'user_role',
                    existingType: false,
                })
                .defaultTo(UserRole.Customer)
            table.timestamp('created_at', { useTz: true }).notNullable()
            table.timestamp('updated_at', { useTz: true }).notNullable()
            table.timestamp('deleted_at').defaultTo(null)
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
