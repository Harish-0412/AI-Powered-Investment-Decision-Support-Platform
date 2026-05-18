import type { RiskLevel } from "@prisma/client";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      riskLevel: RiskLevel;
    }

    interface Request {
      user?: User;
    }
  }
}
