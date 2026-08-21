import dotenv from "dotenv";

// Load environment variables FIRST before any other imports
dotenv.config();

import { generateDocs } from "../utils/docGenerator";

// Execute document generation
generateDocs();
