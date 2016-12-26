module.exports =  {
  httpMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  statusCode: {
    OK: {
      code: 200
    },
    BadRequest: {
      code: 400,
      response: {
        statusCode: 400,
        error: 'Bad Request',
        message: 'Requests other than GET, POST, PUT, PATCH, DELETE are not supported'
      }
    },
    NotFound: {
      code: 404,
      response: {
        statusCode: 404,
        error: 'Not Found'
      }
    },
    InternalServerError: {
      code: 500,
      response: {
        statusCode: 500,
        error: "Internal Server Error",
        message: "An internal server error occurred"
      }
    },
  }
};
