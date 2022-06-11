/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

// Dashboard API
Route.group(async () => {
    Route.post('/upload', 'AttachmentsController.create')

    Route.group(() => {
        Route.get('/', 'ProductsController.index')
        Route.post('/', 'ProductsController.create')
        Route.get('/:id', 'ProductsController.show')
        Route.put('/:id', 'ProductsController.update')
        Route.delete('/:id', 'ProductsController.delete')
    }).prefix('/products')

    // Brands
    Route.group(() => {
        Route.get('/', 'BrandsController.index')
        Route.post('/', 'BrandsController.create')
        Route.put('/:id', 'BrandsController.update')
        Route.delete('/:id', 'BrandsController.delete')
    }).prefix('/brands')
})
    .prefix('/dashboard')
    .middleware('detectUserLocale')
