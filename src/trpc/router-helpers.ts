/**
 * Helper para simplificar imports nos routers
 */
export {
  createTRPCRouter as router,
  baseProcedure as publicProcedure,
  protectedProcedure,
  adminProcedure,
  editProcedure,
  createPermissionProcedure,
  createAnyPermissionProcedure,
} from "./init";

export { Permission } from "@/lib/permissions";

