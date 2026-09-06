import { can } from "../src/lib/permissions";
console.log("Can Department read projects?", can("DEPARTMENT", "project:read"));

