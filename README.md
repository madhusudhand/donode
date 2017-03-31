# donode

Superfast & Lightweight node framework for building RESTful APIs.

**Simple** . **Flexible** . **High Performance** . **ES2015+**

Enables developers to focus on writing reusable application logic in a
highly modular approach.

**Use [donode-cli](https://www.npmjs.com/package/donode-cli), to get started.**

## Performance

Here are the [performance results](https://github.com/madhusudhand/node-performance).

## Documentation

### App Structure

Create the app using [donode-cli](https://www.npmjs.com/package/donode-cli),
it is as **simple** and **modular** as

- app
  - controllers
  - middleware
  - headers.js
  - routes.js
- env
  - development.env.js
  - production.env.js
- app.js

### Routing

**One Place** for all your routes and they go into **app/routes.js**.

A Route can be as *simple* as

```
{
  path: '/hello',
  method: 'GET',
  handler: 'HelloController@get'
}
```
| Property | Type      |  Description  |
| :---     | :---      |  :---         |
| path     | string    |  url for the route |
| method   | string    |  can be one of GET, POST, PUT, UPDATE, DELETE. |
| handler  | string    |  **format**: *SomeController@method* <br> Here in this format **SomeController** is the controller (a class) located in **app/controllers** directory. <br><br> And **method** (name after @) is the name of the method in the given controller, which gets called and send response. <br><br> more details availale in **controllers** section.  |

#### Advanced Routing

A Route can take options like *middleware, headers, children*.

```
{
  path: '/user/{id}',
  method: 'GET',
  handler: 'UserController@get',
  middleware: ['Auth'],
  headers: ['allow-cors'],
  children: [{
  	path: '/settings',
    method: 'GET',
    handler: 'UserController@settings',
  }]
}
```
| Property | Type      |  Description  |
| :---     | :---      |  :---         |
| path     | string    |  A route can have params in its path. <br/> *syntax*: **{param}** <br><br> *example*: <br>*/user/{id}* can respond to */user/1, /user/123* etc..|
| method   | string    |  values are not limited GET, POST, PUT, UPDATE, DELETE. <br/> can be any type of request that server can listen to. (HEAD, OPTIONS etc..) |
| handler  | string    |  A controller can be from a sub directory inside controllers directory. <br> *syntax*: **subdirectory/SomeController@method** <br/> here in this *SomeController* is located in *app/controllers/subdirectory*. |
| middleware | array <br> or <br> object    |  A Middleware is an intermediate handler which can be used to perform some pre-checks such as Auth. <br>It is a class located in **app/middleware** directory and will be called before the **handler** method. <br><br> ***Array** Syntax*: **['Middleware1', 'Middleware2']** <br><br> A list of strings which are the names of the *classes* from *app/middleware* directory. When attached to a route, these will be called in the given order before the actual **handler**. <br><br> more details availale in **middleware** section. <br><br> ***Object** syntax*: <br>**{ <br> &nbsp;&nbsp; all: ['Middleware1'],<br> &nbsp;&nbsp; current: ['Middleware2'],<br> &nbsp;&nbsp; children: ['Middleware3'] <br> }** <br><br> -- **all**: attached to current the route and all its children. <br> -- **current**: attached only to current route. <br> -- **children**: attached to all the children, but not to current route. <br><br> **Note**: All are optional. Any of them can be given/ignored. <br><br> **Order**: middleware defined under **all, children** which are comming from parent routes (if any), then **all, current** of current route. |
| headers  | array    | **headers** property allows to attach a set of headers that can to be sent along with the *response* for every request. <br> It takes an array of stings which are defined in **app/headers.js**. <br><br> **syntax**<br> ['allow-cors', 'json-content'] <br><br> **Note**: currently headers attached to a route will apply only to it. Not to children. Object syntax is yet to come !!!|
| children | array    |  Routes can be nested with this attribute. <br> This takes list of sub-routes which takes same set of above properties. <br><br> **example route config** <br>{ <br> &nbsp;&nbsp;path: '/user/{id}', <br>&nbsp;&nbsp;method: 'GET',<br>&nbsp;&nbsp;handler: 'UserController@get',<br>&nbsp;&nbsp;children: [{<br>&nbsp;&nbsp;&nbsp;&nbsp; path: '/settings', <br>&nbsp;&nbsp;&nbsp;&nbsp; method: 'POST', <br>&nbsp;&nbsp;&nbsp;&nbsp; handler: 'UserController@settings'<br>&nbsp;&nbsp;}]<br> } <br><br> this will register the routes<br> **GET**: */user/{id}* <br> **POST**: */user/{id}/settings* |



### Controllers

**app/controllers**: A place for all controllers of the app.

A controller is a class which inherits **Controller** from donode, and has the handler methods of a route.

```js
const Controller = require('donode').Controller;

class HomeController extends Controller {
  constructor() {
    super();
  }

  get(request, response) {
    response.send({
      'app': 'works !!!'
    });
  }
}

module.exports = HomeController;
```

The method **get(request, response)** will be the handler for a route.

```
handler: 'HomeController@get'
```

It gets *request, response* as params.

#### Request

It is a native *Node Request* object. Along with default properties it also contains


| Property | Route     |  Values  |
| :---     | :---      |  :---         |
| queryParams | /user?p1=123&p2=donode | { p1: 123, p2: 'donode' } |
| routeParams | /user/{id} | { id: 123 } |
| body | - | payload sent along with request |
| headers | - | headers sent along with request |
| url | - | {  } |
| originalUrl | /user/{id} | /user/123 |
| method | - | GET, POST, PUT, DELETE etc.. |


#### Response

It is a native *Node Response* object. Along with default properties it also contains


| Method | definition     |  Description  |
| :---     | :---      |  :---         |
| send | send([response_code,] responseObject) | It takes optional response code and a response object which whill be sent. <br><br> default: 200 (OK) |
| reject | reject([response_code], responseObject) | takes optional response_code and rejection responseObject. <br><br>default: 401 (bad request) |
| setHeader | setHeader(type, value) | takes header type and value |


### Middleware

```
const Middleware = require('donode').Middleware;

class Auth extends Middleware {
  constructor() {
    super();
  }

  handle(request, response, next) {
    // do some auth validation here

    // if (not authorized)
    // return response.send(401, { some: 'error data' });

    // else (proceed to the controller hander)
    return next();
  }
}

module.exports = Auth;
```

**Note**:

When response.send() or response.reject() are called in a middleware, the call chain stops and handler method will not be called.

### Environments

Environments for the app can be managed by creating corresponding configuration file

> env/<environment-name>.env.js

This configuration can be used with **NODE_ENV** while running the app.

> $ NODE_ENV=<environment-name> node app.js

**Examples:**

```
NODE_ENV=production node app.js
NODE_ENV=stage node app.js
```

Without NODE_ENV it defaults to `development.env.js`.
