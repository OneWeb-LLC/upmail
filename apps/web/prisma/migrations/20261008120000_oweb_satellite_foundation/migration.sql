-- OWeb satellite identity bridge (Prisma app DB). One OS tables live in Supabase.

ALTER TABLE "User" ADD COLUMN "supabaseAuthId" UUID;

CREATE UNIQUE INDEX "User_supabaseAuthId_key" ON "User"("supabaseAuthId");

CREATE TABLE "UpmailProfile" (
    "userId" TEXT NOT NULL,
    "oneIdHandle" TEXT,
    "activeOwebWorkspaceId" UUID,
    "autonomousSendEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UpmailProfile_pkey" PRIMARY KEY ("userId")
);

CREATE TABLE "UpmailEmailAccountWorkspace" (
    "id" TEXT NOT NULL,
    "owebWorkspaceId" UUID NOT NULL,
    "emailAccountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UpmailEmailAccountWorkspace_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UpmailEmailAccountWorkspace_emailAccountId_key" ON "UpmailEmailAccountWorkspace"("emailAccountId");

CREATE INDEX "UpmailEmailAccountWorkspace_owebWorkspaceId_idx" ON "UpmailEmailAccountWorkspace"("owebWorkspaceId");

ALTER TABLE "Rule" ADD COLUMN "autonomousSendEnabled" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "UpmailProfile" ADD CONSTRAINT "UpmailProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UpmailEmailAccountWorkspace" ADD CONSTRAINT "UpmailEmailAccountWorkspace_emailAccountId_fkey" FOREIGN KEY ("emailAccountId") REFERENCES "EmailAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
