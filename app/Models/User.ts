import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'

import {
    column,
    beforeSave,
    BaseModel,
    beforeFind,
    beforeFetch,
    ModelQueryBuilderContract,
} from '@ioc:Adonis/Lucid/Orm'
import { UserRole } from 'App/Enums/UserRole'

class User extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public name: string

    @column()
    public username: string

    @column()
    public email: string

    @column()
    public phone: string

    @column({ serializeAs: null })
    public password: string

    @column()
    public rememberMeToken?: string

    @column()
    public avatar: string

    @column()
    public gender: string

    @column()
    public company: string

    @column()
    public isVerified: boolean

    @column()
    public isActive: boolean

    @column()
    public role: UserRole

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    @column.dateTime({ serializeAs: null })
    public deletedAt: DateTime

    @beforeFind()
    @beforeFetch()
    public static softDeletesFind = (query: ModelQueryBuilderContract<typeof BaseModel>) => {
        query.whereNull('deleted_at')
    }

    @beforeSave()
    public static async hashPassword(user: User) {
        if (user.$dirty.password) {
            user.password = await Hash.make(user.password)
        }
    }
}

User['findForAuth'] = async function (uid: string[], uidValue: string) {
    return this.query()
        .where((query) => uid.map((uid) => query.orWhere(uid, 'ILIKE', uidValue)))
        .firstOrFail()
}

export default User
