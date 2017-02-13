module.exports =  {
  // Success status codes 2xx
  OK: {
    code: 200
  },
  200: {
    key: 'OK'
  },
  Created: {
    code: 201
  },
  201: {
    key: 'Created'
  },
  NoContent: {
    code: 204
  },
  204: {
    key: 'NoContent'
  },

  // Redirection status codes 3xx
  MovedPermanently: {
    code: 301
  },
  301: {
    key: 'MovedPermanently'
  },

  // Client Error status codes 4xx
  BadRequest: {
    code: 400,
    response: {
      statusCode: 400,
      error: 'Bad Request',
      message: 'Not a valid request'
    }
  },
  400: {
    key: 'BadRequest'
  },
  Unauthorized: {
    code: 401,
    response: {
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Unauthorized'
    }
  },
  401: {
    key: 'Unauthorized'
  },
  Forbidden: {
    code: 403,
    response: {
      statusCode: 403,
      error: 'Forbidden',
      message: 'Forbidden'
    }
  },
  403: {
    key: 'Forbidden'
  },
  NotFound: {
    code: 404,
    response: {
      statusCode: 404,
      error: 'Not Found'
    }
  },
  404: {
    key: 'NotFound'
  },

  // Server Error status codes 5xx
  InternalServerError: {
    code: 500,
    response: {
      statusCode: 500,
      error: "Internal Server Error",
      message: "An internal server error occurred"
    }
  },
  500: {
    key: 'InternalServerError'
  },

};
