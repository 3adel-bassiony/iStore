import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import { UserRole } from 'App/Enums/UserRole'
import User from 'App/Models/User'

export default class extends BaseSeeder {
    public async run() {
        await User.create({
            name: 'Adel Bassiony',
            username: '3adel_bassiony',
            email: 'a.bassiony@icloud.com',
            password: 'admin1020',
            phone: '00201123456789',
            gender: 'male',
            isVerified: true,
            isActive: true,
            avatar: 'https://pbs.twimg.com/profile_images/1375164653077196804/Osj_-95V_400x400.jpg',
            role: UserRole.Owner,
        })
    }
}
