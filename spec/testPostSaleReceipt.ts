require("jasmine");
import { AddCommissionedEmployee } from "../payroll_system/transaction";
import { PayrollDatabase } from "../payroll_system/payroll_database";
import { Employee } from "../payroll_system/employee";
import { SaleReceiptTransaction } from "../payroll_system/transaction";
import { CommissionedClassification } from "../payroll_system/payment_classification";
import { SaleReceipt } from "../payroll_system/sale_receipt";


describe("testPostSalesReceipt", () => {

    it("postSalesReceipt", () => {
        const empId: number = 23424;

        const addCommissionedEmployee: AddCommissionedEmployee =
            new AddCommissionedEmployee(empId,
                                        "Blake",
                                        "3rd Street on the Rue",
                                        20,
                                        0.15);
        addCommissionedEmployee.execute();
        const possibleEmployee = PayrollDatabase.getEmployee(empId);
        expect(possibleEmployee).not.toBeUndefined();
        const employee = possibleEmployee as Employee;

        const today = new Date();
        const salesReceiptTransaction: SaleReceiptTransaction =
            new SaleReceiptTransaction(empId, today, 150);
        salesReceiptTransaction.execute();

        const paymentClassification = employee.classification;
        expect(paymentClassification instanceof CommissionedClassification)
            .toBe(true);
        const commissionedClasssification =
            paymentClassification as CommissionedClassification;

        const possibleSaleReceipt = commissionedClasssification
            .getSaleReceipt(today);
        expect(possibleSaleReceipt).not.toBeUndefined();
        const saleReceipt = possibleSaleReceipt as SaleReceipt;
        expect(saleReceipt.amount).toBe(150);
    })
})
