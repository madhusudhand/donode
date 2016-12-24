module.exports =  {
  httpMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  statusCode: {
    badRequest: {
      code: 500
    },
    OK: {
      code: 200
    },
    NotFound: {
      code: 404
    }
  }
};
