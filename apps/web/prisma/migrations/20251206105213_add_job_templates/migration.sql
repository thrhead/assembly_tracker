-- CreateTable
CREATE TABLE "job_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_steps" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "template_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_sub_steps" (
    "id" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "template_sub_steps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "job_templates_name_key" ON "job_templates"("name");

-- AddForeignKey
ALTER TABLE "template_steps" ADD CONSTRAINT "template_steps_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "job_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_sub_steps" ADD CONSTRAINT "template_sub_steps_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "template_steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
