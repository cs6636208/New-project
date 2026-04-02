import { methodCatalog } from "../modules/methods/method-catalog.js";

const methodKeys = methodCatalog.map((method) => method.key);

export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Numerical Method API",
    version: "1.0.0",
    description: "API for numerical method calculations, history storage, and method catalog."
  },
  servers: [
    {
      url: "/api"
    }
  ],
  components: {
    schemas: {
      CreateRunRequest: {
        type: "object",
        required: ["equation", "primaryInput"],
        properties: {
          equation: { type: "string", example: "x^4 - 13" },
          primaryInput: { type: "number", example: 1.5, description: "XL, X0, or Start X depending on the selected method." },
          secondaryInput: {
            type: "number",
            nullable: true,
            example: 2,
            description: "XR, X1, or End X for methods that require two starting values."
          },
          epsilon: { type: "number", example: 0.000001, default: 0.000001 },
          maxIterations: { type: "integer", example: 100, default: 100 }
        }
      },
      IterationRow: {
        type: "object",
        description: "Method-specific iteration data. Each method returns its own fields together with iteration and error.",
        additionalProperties: true
      }
    }
  },
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: {
          "200": {
            description: "API is running"
          }
        }
      }
    },
    "/methods": {
      get: {
        summary: "List available numerical methods",
        responses: {
          "200": {
            description: "Available methods"
          }
        }
      }
    },
    "/runs": {
      get: {
        summary: "List latest computation runs",
        parameters: [
          {
            name: "limit",
            in: "query",
            schema: {
              type: "integer",
              default: 10
            }
          }
        ],
        responses: {
          "200": {
            description: "Latest saved runs"
          }
        }
      }
    },
    "/runs/{methodKey}": {
      post: {
        summary: "Calculate and save a numerical method run",
        parameters: [
          {
            name: "methodKey",
            in: "path",
            required: true,
            schema: {
              type: "string",
              enum: methodKeys
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateRunRequest"
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Calculated and saved successfully"
          },
          "400": {
            description: "Payload validation failed"
          }
        }
      }
    }
  }
};
