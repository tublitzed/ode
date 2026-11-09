-- CreateTable
CREATE TABLE "shared_odes" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "ode" TEXT NOT NULL,
    "comparison" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shared_odes_pkey" PRIMARY KEY ("id")
);
