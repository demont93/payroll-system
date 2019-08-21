require("jamine");
import { AddCommissionedEmployee } from "../payroll_system/transaction";
import { PayrollDatabase } from "../payroll_system/payroll_database";


describe("testPostSalesReceipt", () => {

    it("postSalesReceipt", () => {
        const empId: number = 6;

        const addCommissionedEmployee: AddCommissionedEmployee =
            new AddCommissionedEmployee(empId, "Blake",
                                        "3rd Street on the Rue",
                                        20,
                                        0.15);
        addCommissionedEmployee.execute();
        const employee: Employee | undefined = PayrollDatabase.getEmployee(empId);
        expect(employee).not.toBeUndefined();

        const today = new Date();
        const salesReceiptTransaction: SalesReceiptTransaction =
            new SalesReceiptTransaction(empId, today, 150);
        salesReceiptTransaction.execute();

        const paymentClassification: PaymentClassification =
            employee.classification;
        expect(paymentClassification instanceof CommissionedClassification)
            .toBe(true);
        const commissionedClasssification =
            paymentClassification as CommissionedClassification;

        const salesReceipt: SalesReceipt = commissionedClasssification
            .getSalesReceipt(today);
        expect(salesReceipt.amount).toBe(150);
    })
})
