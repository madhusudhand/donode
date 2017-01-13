# donode (ALPHA)

Superfast & Lightweight node framework for building RESTful APIs.

**Use [donode-cli](https://www.npmjs.com/package/donode-cli), to get started.**

## Features

* Flexible routing
* Built to work with ES6
* High Performance


## Documentation

### Routing

Your routes are simple and takes the following format.

```
{
  path: '/hello',
  method: 'GET',
  handler: 'HelloController@get'
}
```

#### sub-routes

A route object takes **children: []** which will have the same route pattern.

```
{
  path: '/hello',
  method: 'GET',
  handler: 'HelloController@get',
  children: [
    path: '/world',
    method: 'POST',
    handler: 'WorldController@post',
  ]
}
```

Resources in the above case will be a **GET** resource **/hello** and a **POST** resouce **/hello/wolrd**.

#### routes with params

```
{
  path: '/hello/{id}',
  method: 'GET',
  handler: 'HelloController@get'
}
```

handler function (which is get method of HelloController) will get a request object which contains all the param values.

#### Request Object

* queryParams
* routeParams
* body

### Middleware

Middleware objects are singletons

# Reference

how to use: look at [donode-example](https://github.com/donode/donode-example)
