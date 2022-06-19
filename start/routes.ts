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

Route.post('/upload', 'AttachmentsController.create')

// Dashboard API
Route.group(async () => {
    // Auth
    Route.group(() => {
        Route.post('/login', 'AuthController.login').as('login')
        Route.post('/logout', 'AuthController.logout').as('logout')
        Route.post('/forgot-password', 'AuthController.forgotPassword').as('forgotPassword')
        Route.post('/reset-password/:email', 'AuthController.resetPassword').as('resetPassword')
        Route.get('/verify/:email', 'AuthController.verifyEmail').as('verifyEmail')
    }).prefix('auth')

    Route.group(() => {
        // Admins
        Route.group(() => {
            Route.get('/', 'AdminsController.index')
            Route.post('/', 'AdminsController.create')
            Route.get('/:id', 'AdminsController.show')
            Route.put('/:id', 'AdminsController.update')
            Route.delete('/:id', 'AdminsController.delete')
        })
            .prefix('/admins')
            .middleware('adminRole:Owner,Admin')

        // Customers
        Route.group(() => {
            Route.get('/', 'CustomersController.index')
            Route.post('/', 'CustomersController.create')
            Route.get('/:id', 'CustomersController.show')
            Route.put('/:id', 'CustomersController.update')
            Route.delete('/:id', 'CustomersController.delete')
        }).prefix('/customers')

        // Products
        Route.group(() => {
            Route.get('/', 'ProductsController.index')
            Route.post('/', 'ProductsController.create')
            Route.get('/:id', 'ProductsController.show')
            Route.put('/:id', 'ProductsController.update')
            Route.delete('/:id', 'ProductsController.delete')
        }).prefix('/products')

        // Collections
        Route.group(() => {
            Route.get('/', 'CollectionsController.index')
            Route.post('/', 'CollectionsController.create')
            Route.get('/:id', 'CollectionsController.show')
            Route.put('/:id', 'CollectionsController.update')
            Route.delete('/:id', 'CollectionsController.delete')
        }).prefix('/collections')

        // Brands
        Route.group(() => {
            Route.get('/', 'BrandsController.index')
            Route.post('/', 'BrandsController.create')
            Route.put('/:id', 'BrandsController.update')
            Route.delete('/:id', 'BrandsController.delete')
        }).prefix('/brands')

        // Addresses
        Route.group(() => {
            Route.post('/', 'AddressesController.create')
            Route.get('/:id', 'AddressesController.show')
            Route.put('/:id', 'AddressesController.update')
            Route.delete('/:id', 'AddressesController.delete')
        }).prefix('/addresses')
    }).middleware('auth:api')
})
    .prefix('/dashboard')
    .namespace('App/Controllers/Http/Dashboard')
    .middleware('detectUserLocale')
