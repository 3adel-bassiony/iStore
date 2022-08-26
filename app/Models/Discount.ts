import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { DiscountType } from 'App/Enums/DiscountType'

export default class Discount extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public code: string

    @column()
    public type: DiscountType

    @column()
    public value: number

    @column()
    public quantity: number

    @column()
    public hasMinimumAmount: boolean

    @column()
    public minimumAmount: number

    @column()
    public isActive: boolean

    @column()
    public start_at: DateTime

    @column()
    public end_at: DateTime

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    @column.dateTime({ serializeAs: null })
    public deletedAt: DateTime
}
