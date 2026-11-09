-- CreateTable
CREATE TABLE "SharedOde" (
    "id" TEXT NOT NULL,
    "comparison" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ode" TEXT NOT NULL,
    "topic" TEXT NOT NULL,

    CONSTRAINT "SharedOde_pkey" PRIMARY KEY ("id")
);
