import swaggerJSDoc from "swagger-jsdoc";
import { serve } from "swagger-ui-express";

const options = {
definition: {
    openapi: "3.0.0",
    info: {
        title: "API de chistes",
        version: "1.0.0",
        description:
            "Esta es una API de chistes, donde se pueden obtener chistes de Chuck Norris, chistes de papá y chistes propios.",
        contact: {
            name: "Jorge Rubiano"
        },
        servers: ["http://localhost:3005"

        ]
    },
    },
apis: ["./src/index.js"]
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;