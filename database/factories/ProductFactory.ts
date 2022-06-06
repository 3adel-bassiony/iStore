import Product from 'App/Models/Product'
import Factory from '@ioc:Adonis/Lucid/Factory'
import { ProductStatus } from 'App/Enums/ProductStatus'

export default Factory.define(Product, ({ faker }) => {
    const title = faker.commerce.productName()
    return {
        slug: faker.helpers.slugify(title),
        title,
        description: faker.commerce.productDescription(),
        price: Number(faker.commerce.price(200, 300)),
        cost_price: Number(faker.commerce.price(100, 200)),
        special_price: Number(faker.commerce.price(200, 250)),
        quantity: Number(faker.random.numeric(3)),
        thumbnail: faker.image.business(1000, 1000),
        sku: `${faker.finance.bic()}-${faker.finance.bic()}`,
        barcode: faker.finance.bic(),
        model: 'Pro Max',
        status: ProductStatus.Active,
        seo_title: title,
        seo_description: faker.commerce.productDescription(),
        seo_keywords: 'test, keyword',
    }
}).build()
