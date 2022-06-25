/*
|--------------------------------------------------------------------------
| Preloaded File
|--------------------------------------------------------------------------
|
| Any code written inside this file will be executed during the application
| boot.
|
*/

import { validator } from '@ioc:Adonis/Core/Validator'
import { ProductStatus } from 'App/Enums/ProductStatus'
import Product from 'App/Models/Product'

validator.rule(
    'hasValidProductQuantity',
    async (value, _, options) => {
        if (typeof value !== 'number') {
            return
        }

        const id = validator.helpers.getFieldValue('id', options.root, options.tip)

        const product = await Product.query().where('id', id).first()

        if (!product || product.quantity === 0 || product.status === ProductStatus.OutOfStock) {
            return
        }

        if (value > product!.quantity) {
            options.errorReporter.report(
                options.pointer,
                'hasValidProductQuantity',
                'hasValidProductQuantity validation failed',
                options.arrayExpressionPointer
            )
        }
    },
    () => {
        return {
            async: true,
        }
    }
)
