import { DateTime } from 'luxon'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'
import { string } from '@ioc:Adonis/Core/Helpers'

export default class AttachmentsController {
    public async create({ request }: HttpContextContract) {
        const attachment = request.file('attachment', {
            size: '10mb',
            extnames: ['jpg', 'jpeg', 'png'],
        })

        if (!attachment) {
            return
        }

        if (!attachment.isValid) {
            return attachment.errors
        }

        await attachment.move(Application.tmpPath('uploads'), {
            name: `${DateTime.local().toMillis()}-${string.generateRandom(10)}.${
                attachment.subtype
            }`,
        })

        return {
            fileName: attachment.fileName,
            url: `${process.env.APP_URL}/uploads/${attachment.fileName}`,
        }
    }
}
