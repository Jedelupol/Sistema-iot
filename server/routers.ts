import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { profesoresRouter } from "./routers/profesores";
import { alumnosRouter } from "./routers/alumnos";
import { matriculaRouter } from "./routers/matricula";
import { asistenciaRouter } from "./routers/asistencia";
import { institucionRouter } from "./routers/institucion";
import { importacionRouter } from "./routers/importacion";
import { alertasRouter } from "./routers/alertas";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  institucion: institucionRouter,
  importacion: importacionRouter,
  alertas: alertasRouter,
  profesores: profesoresRouter,
  alumnos: alumnosRouter,
  matricula: matriculaRouter,
  asistencia: asistenciaRouter,
});

export type AppRouter = typeof appRouter;
