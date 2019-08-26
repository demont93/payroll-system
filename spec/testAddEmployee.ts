require("jasmine")
import { AddSalariedEmployee, AddHourlyEmployee, AddCommissionedEmployee } from "../payroll_system/transaction"
import { Employee } from "../payroll_system/employee"
import { PayrollDatabase } from "../payroll_system/payroll_database"
import { HourlyClassification, PaymentClassification, SalariedClassification, CommissionedClassification } from "../payroll_system/payment_classification";
import { WeeklySchedule, PaymentSchedule, BiweeklySchedule, MonthlySchedule } from "../payroll_system/payment_schedule";
import { PaymentMethod, HoldMethod } from "../payroll_system/payment_method";


describe("TestAddEmployee", () => {

    it("addSalariedEmployee", () => {
        const empId: number = 1;
        const addSalariedEmployee: AddSalariedEmployee = new AddSalariedEmployee(
            empId,
            "Bob",
            "Home",
            1000.00
        );
        addSalariedEmployee.execute();

        const dbResult = PayrollDatabase.getEmployee(empId);
        expect(typeof dbResult !== undefined).toBe(true);

        const employee = dbResult as Employee;
        expect(employee.name).toBe("Bob");

        const paymentClassification: PaymentClassification =
            employee.classification;
        expect(paymentClassification instanceof SalariedClassification).toBe(true);
        const salariedClassification = paymentClassification as SalariedClassification;
        expect(salariedClassification.salary).toBe(1000.00);

        const paymentSchedule: PaymentSchedule = employee.schedule;
        expect(paymentSchedule instanceof MonthlySchedule).toBe(true);

        const paymentMethod: PaymentMethod = employee.paymentMethod;
        expect(paymentMethod instanceof HoldMethod);
    });

    it("addHourlyEmployee", () => {
        const empId: number = 2;
        const addHourlyEmployee: AddHourlyEmployee = new AddHourlyEmployee(
            empId,
            "Peter",
            "234 Yensen St. 33040",
            13.90
        );
        addHourlyEmployee.execute();

        const dbResult = PayrollDatabase.getEmployee(empId);
        expect(typeof dbResult !== "undefined").toBe(true);
        const employee: Employee = dbResult as Employee;
        expect(employee.name).toBe("Peter");

        const paymentClassification: PaymentClassification =
            employee.classification;
        expect(paymentClassification instanceof HourlyClassification)
            .toBe(true);
        const hourlyClassification =
            paymentClassification as HourlyClassification;
        expect(hourlyClassification.hourlyRate).toBe(13.90);

        const paymentSchedule: PaymentSchedule = employee.schedule;
        expect(paymentSchedule instanceof WeeklySchedule).toBe(true);

        const paymentMethod: PaymentMethod = employee.paymentMethod;
        expect(paymentMethod instanceof HoldMethod).toBe(true);
    })

    it("addCommissionedEmployee", () => {
        const empId: number = 4;
        const addCommissionedEmployee: AddCommissionedEmployee =
            new AddCommissionedEmployee(empId,
                                        "John",
                                        "Some address",
                                        12.00,
                                        0.10)
        addCommissionedEmployee.execute();

        const dbResult = PayrollDatabase.getEmployee(empId);
        expect(typeof dbResult !== "undefined").toBe(true);
        const employee: Employee = dbResult as Employee;
        expect(employee.name).toBe("John");

        const paymentClassification: PaymentClassification =
            employee.classification;
        expect(paymentClassification instanceof CommissionedClassification)
            .toBe(true);
        const commissionedClassification =
            paymentClassification as CommissionedClassification;
        expect(commissionedClassification.hourlyRate).toBe(12.00);
        expect(commissionedClassification.commissionRate).toBe(0.10);

        const paymentSchedule: PaymentSchedule = employee.schedule;
        expect(paymentSchedule instanceof BiweeklySchedule).toBe(true);

        const paymentMethod: PaymentMethod = employee.paymentMethod;
        expect(paymentMethod instanceof HoldMethod).toBe(true);
    })
});
