require("jasmine");
import { AddHourlyEmployee, TimeCardTransaction } from "../payroll_system/transaction";
import { Employee } from "../payroll_system/employee";
import { PayrollDatabase } from "../payroll_system/payroll_database";
import { HourlyClassification } from "../payroll_system/payment_classification";
import { PaymentClassification } from "../payroll_system/payment_classification";
import { TimeCard } from "../payroll_system/time_card";


describe("testPostTimeCard", () => {

    it("postTimeCardToHourlyEmployee", () => {
        const empId: number = 234;
        const addHourlyEmployee: AddHourlyEmployee =
            new AddHourlyEmployee(empId, "Jackson", "address3", 8);
        addHourlyEmployee.execute();

        const today: Date = new Date();
        const timeCardTransaction: TimeCardTransaction =
            new TimeCardTransaction(empId, today, 3);
        timeCardTransaction.execute();

        const possibleEmployee: Employee | undefined = PayrollDatabase.getEmployee(empId);
        expect(possibleEmployee).not.toBeUndefined();

        const employee = possibleEmployee as Employee;

        const paymentClassification = employee.classification;
        expect(paymentClassification instanceof HourlyClassification).toBe(true);
        const hourlyClassification = paymentClassification as HourlyClassification;

        const possibleTimeCard = hourlyClassification.getTimeCard(today);
        expect(possibleTimeCard).not.toBeUndefined();
        const timeCard = possibleTimeCard as TimeCard;
        expect(timeCard.hours).toBe(3);
    })
})
