import fs from "fs";
import path from "path";
import { serviceRegistry } from "../services/serviceRegistry";

const sampleBodies: Record<string, { payload?: any; params?: any; query?: any }> = {
  "auth.register": {
    payload: { name: "John Doe", email: "john@example.com", password: "password123" },
  },
  "auth.login": {
    payload: { email: "john@example.com", password: "password123" },
  },
  "auth.changePassword": {
    payload: { oldPassword: "password123", newPassword: "newpassword123" },
  },
  "meetings.list": {
    query: { page: 1, limit: 10, sortBy: "date", sortOrder: "desc" },
  },
  "meetings.get": {
    params: { id: "65b9c1f2d3a4e5b6c7d8e9f0" },
  },
  "meetings.create": {
    payload: { title: "Sprint Planning", transcript: "Maya: Let's scope. Devon: Tokenizing.", date: "2026-08-17" },
  },
  "meetings.update": {
    params: { id: "65b9c1f2d3a4e5b6c7d8e9f0" },
    payload: { title: "Sprint Planning - Updated" },
  },
  "meetings.delete": {
    params: { id: "65b9c1f2d3a4e5b6c7d8e9f0" },
  },
  "meetings.summarize": {
    params: { id: "65b9c1f2d3a4e5b6c7d8e9f0" },
  },
  "meetings.chat": {
    params: { id: "65b9c1f2d3a4e5b6c7d8e9f0" },
    payload: { message: "What did Nitish say?" },
  },
  "meetings.publish": {
    params: { id: "65b9c1f2d3a4e5b6c7d8e9f0" },
  },
  "meetings.archive": {
    params: { id: "65b9c1f2d3a4e5b6c7d8e9f0" },
  },
  "meetings.unarchive": {
    params: { id: "65b9c1f2d3a4e5b6c7d8e9f0" },
  },
  "meetings.restore": {
    params: { id: "65b9c1f2d3a4e5b6c7d8e9f0" },
  },
  "meetings.pin": {
    params: { id: "65b9c1f2d3a4e5b6c7d8e9f0" },
  },
  "meetings.clone": {
    payload: { meeting: { title: "Cloned Team Sync", transcript: "Maya: Reviewing roadmap notes." } },
  },
  "meetings.permanentDelete": {
    params: { id: "65b9c1f2d3a4e5b6c7d8e9f0" },
  },
  "meetings.publicShareGet": {
    params: { token: "share-token-xyz-123" },
  },
  "actionItems.list": {
    query: { page: 1, limit: 10, status: "Pending", priority: "High" },
  },
  "actionItems.get": {
    params: { id: "65b9c1f2d3a4e5b6c7d8e9f1" },
  },
  "actionItems.getByMeeting": {
    params: { meetingId: "65b9c1f2d3a4e5b6c7d8e9f0" },
  },
  "actionItems.create": {
    payload: {
      task: "Review design tokens",
      owner: "Devon Developer",
      dueDate: "2026-08-25",
      priority: "High",
      status: "Pending",
      meetingId: 1,
    },
  },
  "actionItems.update": {
    params: { id: "65b9c1f2d3a4e5b6c7d8e9f1" },
    payload: { status: "In Progress" },
  },
  "actionItems.delete": {
    params: { id: "65b9c1f2d3a4e5b6c7d8e9f1" },
  },
  "settings.update": {
    payload: { theme: "dark", language: "en", timezone: "America/New_York" },
  },
  "jobs.get": {
    params: { id: "job-uuid-12345" },
  },
};

export function generateDocs(): void {
  try {
    const serviceIds = Object.keys(serviceRegistry);

    // 1. Generate serviceIds.ts
    const meetings: Record<string, string> = {};
    const actionItems: Record<string, string> = {};
    const dashboard: Record<string, string> = {};
    const settings: Record<string, string> = {};
    const notifications: Record<string, string> = {};
    const jobs: Record<string, string> = {};
    const auth: Record<string, string> = {};

    for (const id of serviceIds) {
      const parts = id.split(".");
      if (parts.length !== 2) continue;
      const category = parts[0];
      const rawAction = parts[1];

      // Convert camelCase to SCREAMING_SNAKE_CASE
      const action = rawAction.replace(/([A-Z])/g, "_$1").toUpperCase();

      if (category === "auth") {
        auth[action] = id;
      } else if (category === "meetings") {
        meetings[action] = id;
      } else if (category === "actionItems") {
        actionItems[action] = id;
      } else if (category === "dashboard") {
        dashboard[action] = id;
      } else if (category === "settings") {
        settings[action] = id;
      } else if (category === "notifications") {
        notifications[action] = id;
      } else if (category === "jobs") {
        jobs[action] = id;
      }
    }

    const serviceIdsTemplate = `/**
 * Centralized Service ID constants (Auto-generated)
 */
export const SERVICE_IDS = {
  MEETINGS: ${JSON.stringify(meetings, null, 2)},
  ACTION_ITEMS: ${JSON.stringify(actionItems, null, 2)},
  DASHBOARD: ${JSON.stringify(dashboard, null, 2)},
  SETTINGS: ${JSON.stringify(settings, null, 2)},
  NOTIFICATIONS: ${JSON.stringify(notifications, null, 2)},
  JOBS: ${JSON.stringify(jobs, null, 2)},
  AUTH: ${JSON.stringify(auth, null, 2)},
} as const;

export type SERVICE_IDS_TYPE = typeof SERVICE_IDS;

export type ServiceId =
  | typeof SERVICE_IDS.MEETINGS[keyof typeof SERVICE_IDS.MEETINGS]
  | typeof SERVICE_IDS.ACTION_ITEMS[keyof typeof SERVICE_IDS.ACTION_ITEMS]
  | typeof SERVICE_IDS.DASHBOARD[keyof typeof SERVICE_IDS.DASHBOARD]
  | typeof SERVICE_IDS.SETTINGS[keyof typeof SERVICE_IDS.SETTINGS]
  | typeof SERVICE_IDS.NOTIFICATIONS[keyof typeof SERVICE_IDS.NOTIFICATIONS]
  | typeof SERVICE_IDS.JOBS[keyof typeof SERVICE_IDS.JOBS]
  | typeof SERVICE_IDS.AUTH[keyof typeof SERVICE_IDS.AUTH];
`;

    const frontendServiceIdsPath = path.join(__dirname, "../../../../Frontend/src/lib/serviceIds.ts");
    if (fs.existsSync(path.dirname(frontendServiceIdsPath))) {
      fs.writeFileSync(frontendServiceIdsPath, serviceIdsTemplate);
      console.log("[Docs Generator] Successfully updated Frontend serviceIds.ts");
    }

    // 2. Generate Postman Collection
    const postmanItemsMap: Record<string, any[]> = {
      auth: [],
      meetings: [],
      actionItems: [],
      dashboard: [],
      settings: [],
      notifications: [],
      jobs: [],
    };

    for (const [id, def] of Object.entries(serviceRegistry)) {
      const parts = id.split(".");
      const category = parts[0];
      const actionName = parts[1];

      const sample = sampleBodies[id] || {};
      const requestBodyObj: any = {
        serviceId: id,
      };
      if (sample.payload) requestBodyObj.payload = sample.payload;
      if (sample.params) requestBodyObj.params = sample.params;
      if (sample.query) requestBodyObj.query = sample.query;

      const headers = [{ key: "Content-Type", value: "application/json" }];
      if (def.requiresAuth) {
        headers.push({ key: "Authorization", value: "Bearer {{jwt_token}}" });
      }

      const item = {
        name: `${actionName} (${id})`,
        request: {
          method: "POST",
          header: headers,
          body: {
            mode: "raw",
            raw: JSON.stringify(requestBodyObj, null, 2),
          },
          url: {
            raw: "http://localhost:4000/api/service",
            protocol: "http",
            host: ["localhost"],
            port: "4000",
            path: ["api", "service"],
          },
        },
      };

      if (postmanItemsMap[category]) {
        postmanItemsMap[category].push(item);
      }
    }

    const categoriesOrder = ["auth", "meetings", "actionItems", "dashboard", "settings", "notifications", "jobs"];
    const foldersMap: Record<string, string> = {
      auth: "Authentication",
      meetings: "Meetings",
      actionItems: "Action Items",
      dashboard: "Dashboard",
      settings: "Settings",
      notifications: "Notifications",
      jobs: "Jobs",
    };

    const postmanCollection = {
      info: {
        name: "Syncra AI Services Collection",
        description:
          "Postman collection detailing all Syncra AI Service Router endpoint requests. Auto-generated on server startup.",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      },
      item: categoriesOrder.map((cat) => ({
        name: foldersMap[cat] || cat,
        item: postmanItemsMap[cat] || [],
      })),
    };

    const postmanPath = path.join(__dirname, "../../../../syncra_ai_postman_collection.json");
    fs.writeFileSync(postmanPath, JSON.stringify(postmanCollection, null, 2));
    console.log("[Docs Generator] Successfully updated syncra_ai_postman_collection.json");

    // 3. Generate swagger.json
    const schemas: any = {
      RegisterInput: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "Alice Developer" },
          email: { type: "string", format: "email", example: "alice@example.com" },
          password: { type: "string", format: "password", example: "securepass123" },
        },
      },
      LoginInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "alice@example.com" },
          password: { type: "string", format: "password", example: "securepass123" },
        },
      },
      MeetingInput: {
        type: "object",
        required: ["title", "transcript"],
        properties: {
          title: { type: "string", example: "Syncra Weekly Sync" },
          transcript: {
            type: "string",
            example: "Priya: Let's focus on the tablet layout. Nitish: Sure, I'll update it. Alice: I will verify it.",
          },
          date: { type: "string", format: "date", example: "2026-08-14" },
          description: { type: "string", example: "General review of ongoing features and sprint board alignment" },
        },
      },
      ActionItemInput: {
        type: "object",
        required: ["task", "owner", "dueDate", "priority", "status"],
        properties: {
          task: { type: "string", example: "Fix column header widths in ActionItemsTable" },
          owner: { type: "string", example: "Nitish Prajapati" },
          dueDate: { type: "string", format: "date", example: "2026-08-16" },
          priority: { type: "string", enum: ["Low", "Medium", "High"], example: "High" },
          status: { type: "string", enum: ["Pending", "In Progress", "Completed", "Blocked"], example: "In Progress" },
          meetingId: { type: "integer", example: 1 },
        },
      },
    };

    const oneOfReferences: any[] = [];

    for (const [id, def] of Object.entries(serviceRegistry)) {
      const parts = id.split(".");
      const category = parts[0];
      const rawAction = parts[1];
      const action = rawAction.charAt(0).toUpperCase() + rawAction.slice(1);
      const schemaName = `${category.charAt(0).toUpperCase() + category.slice(1)}${action}Request`;

      const schemaProperties: any = {
        serviceId: {
          type: "string",
          enum: [id],
        },
      };

      const requiredFields = ["serviceId"];

      if (def.validation?.body) {
        requiredFields.push("payload");
        if (id === "auth.register") {
          schemaProperties.payload = { $ref: "#/components/schemas/RegisterInput" };
        } else if (id === "auth.login") {
          schemaProperties.payload = { $ref: "#/components/schemas/LoginInput" };
        } else if (id === "meetings.create" || id === "meetings.update") {
          schemaProperties.payload = { $ref: "#/components/schemas/MeetingInput" };
        } else if (id === "actionItems.create") {
          schemaProperties.payload = { $ref: "#/components/schemas/ActionItemInput" };
        } else {
          schemaProperties.payload = { type: "object", description: "Payload structure" };
        }
      }

      if (def.validation?.params) {
        requiredFields.push("params");
        schemaProperties.params = {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", example: "65b9c1f2d3a4e5b6c7d8e9f0" },
          },
        };
      }

      if (def.validation?.query) {
        schemaProperties.query = {
          type: "object",
          description: "Query filters/pagination parameters",
        };
      }

      schemas[schemaName] = {
        type: "object",
        required: requiredFields,
        properties: schemaProperties,
      };

      oneOfReferences.push({ $ref: `#/components/schemas/${schemaName}` });
    }

    const swaggerDoc = {
      openapi: "3.0.0",
      info: {
        title: "Syncra AI Meeting Notes API Documentation",
        version: "1.0.0",
        description:
          "API endpoints for authentication, meeting note processing, task extraction, and action tracking using centralized serviceIds.",
      },
      servers: [
        {
          url: "http://localhost:4000",
          description: "Development Server",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
        schemas,
      },
      paths: {
        "/api/service": {
          post: {
            summary: "Centralized service dispatcher",
            description: "Dispatches requests to internal services using serviceId.",
            tags: ["Centralized Service Router"],
            security: [{ bearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    oneOf: oneOfReferences,
                  },
                },
              },
            },
            responses: {
              "200": {
                description:
                  "Service executed successfully. Returns the JSON response from the target service controller.",
              },
              "400": {
                description: "Validation failed / Bad request",
              },
              "401": {
                description: "Unauthorized / Session token expired",
              },
              "404": {
                description: "Service not found",
              },
            },
          },
        },
        "/api/service/registry": {
          get: {
            summary: "Retrieve registered service definitions catalog",
            description: "Lists all registered serviceIds, authentication requirements, and validation flags.",
            tags: ["Centralized Service Router"],
            responses: {
              "200": {
                description: "Successful retrieval of service registry catalog",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        count: { type: "integer", example: 29 },
                        services: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              serviceId: { type: "string" },
                              requiresAuth: { type: "boolean" },
                              hasBodyValidation: { type: "boolean" },
                              hasQueryValidation: { type: "boolean" },
                              hasParamsValidation: { type: "boolean" },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const swaggerPath = path.join(__dirname, "../swagger.json");
    fs.writeFileSync(swaggerPath, JSON.stringify(swaggerDoc, null, 2));
    console.log("[Docs Generator] Successfully updated swagger.json");
  } catch (err) {
    console.error("[Docs Generator] Error generating API documentation files:", err);
  }
}
