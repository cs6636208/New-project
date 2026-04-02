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
        required: ["equation", "xl", "xr"],
        properties: {
          equation: { type: "string", example: "x^4 - 13" },
          xl: { type: "number", example: 1.5 },
          xr: { type: "number", example: 2 },
          epsilon: { type: "number", example: 0.00001, default: 0.00001 },
          maxIterations: { type: "integer", example: 50, default: 50 }
        }
      },
      IterationRow: {
        type: "object",
        properties: {
          iteration: { type: "integer", example: 1 },
          xl: { type: "number", example: 1.5 },
          xr: { type: "number", example: 2 },
          xm: { type: "number", example: 1.75 },
          fxm: { type: "number", example: -3.62109375 },
          error: { type: "number", nullable: true, example: 14.285714 }
        }
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
              enum: ["bisection", "false-position"]
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

