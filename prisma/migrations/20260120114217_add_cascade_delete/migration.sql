-- DropForeignKey
ALTER TABLE "ExpenditureTag" DROP CONSTRAINT "ExpenditureTag_expenditureId_fkey";

-- AddForeignKey
ALTER TABLE "ExpenditureTag" ADD CONSTRAINT "ExpenditureTag_expenditureId_fkey" FOREIGN KEY ("expenditureId") REFERENCES "Expenditure"("id") ON DELETE CASCADE ON UPDATE CASCADE;
