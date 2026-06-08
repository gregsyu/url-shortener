-- CreateTable
CREATE TABLE "Url" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "original" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Url_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Url_code_key" ON "Url"("code");
