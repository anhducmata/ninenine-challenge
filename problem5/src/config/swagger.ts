import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User Management API',
      version: '1.0.0',
      description:
        'A simple CRUD API for user management with TypeScript and SQLite',
      contact: {
        name: 'API Support',
        email: 'support@userapi.com'
      }
    },
    tags: [
      {
        name: 'Users',
        description: 'User management operations'
      }
    ],
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'age'],
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier for the user',
              example: 1
            },
            name: {
              type: 'string',
              description: 'Name of the user',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the user',
              example: 'john.doe@example.com'
            },
            age: {
              type: 'integer',
              minimum: 0,
              description: 'Age of the user',
              example: 30
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'User last update timestamp'
            }
          }
        },
        UserInput: {
          type: 'object',
          required: ['name', 'email', 'age'],
          properties: {
            name: {
              type: 'string',
              description: 'Name of the user',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the user',
              example: 'john.doe@example.com'
            },
            age: {
              type: 'integer',
              minimum: 0,
              description: 'Age of the user',
              example: 30
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
              example: 'User not found'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts'] // Path to the API docs
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
