require("jasmine")
import { AddSalariedEmployee, AddHourlyEmployee, AddCommissionedEmployee } from "../payroll_system/transaction"
import { Employee } from "../payroll_system/employee"
import { PayrollDatabase } from "../payroll_system/payroll_database"
import { HourlyClassification } from "../payroll_system/classification";


describe("testPostTimeCard", () => {

    it("postTimeCardToHourlyEmployee", () => {
        const empId: number = 5;
        const addHourlyEmployee: AddHourlyEmployee =
            new AddHourlyEmployee(empId, "Jackson", "address3", 8);
        addHourlyEmployee.execute();

        const today: Date = new Date();
        const timeCardTransaction: TimeCardTransaction =
            new TimeCardTransaction(empId, today, 3);
        timeCardTransaction.execute();

        const employee: Employee | undefined = PayrollDatabase.getEmployee(empId);
        expect(employee).not.toBeUndefined();

        const paymentClassification: PaymentClassification =
            employee.paymentClassification;
        expect(paymentClassification instanceof HourlyClassification).toBe(true);
        const hourlyClassification = paymentClassification as HourlyClassification;

        const timeCard: Timecard = hourlyClassification.getTimeCard(today);
        expect(timeCard).not.toBeUndefined();
        expect(timeCard.hours).toBe(8);
    })
})
