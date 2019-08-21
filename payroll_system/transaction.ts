import { PayrollDatabase } from "./payroll_database"
import { HourlyClassification } from "./classification";


export interface Transaction {

    execute(): void;
}


export abstract class AddEmployeeTransaction implements Transaction {

    private readonly empId: number;
    private readonly name: string;
    private readonly address: string;

    constructor(empId: number, name: string, address: string) {
        this.empId = empId;
        this.name = name;
        this.address = address;
    }

    public execute(): void {
        const paymentSchedule: PaymentSchedule = this.makeSchedule();
        const paymentClassification: PaymentClassification =
            this.makeClassification();
        const paymentMethod: PaymentMethod = new HoldPaymentMethod();

        const employee: Employee = new Employee(this.empId,
                                                this.name,
                                                this.address);
        employee.addPaymentClassification(paymentClassification);
        employee.addPaymentSchedule(paymentSchedule);
        employee.addPaymentMethod(paymentMethod);

        PayrollDatabase.addEmployee(this.empId, employee)
    }

    protected abstract makeClassification(): PaymentClassification;

    protected abstract makeSchedule(): PaymentSchedule;
}


export class AddSalariedEmployee extends AddEmployeeTransaction {

    private readonly salary: number;

    constructor(empId: number, name: string, address: string, salary: number) {
        super(empId, name, address);
        this.salary = salary;
    }

    protected makeClassification(): PaymentClassification {
        return new SalariedClassification(this.salary);
    }

    protected makeSchedule(): PaymentSchedule {
        return new MonthlySchedule();
    }
}


export class AddHourlyEmployee extends AddEmployeeTransaction {

    private readonly hourlyRate: number;

    constructor(empId: number, name: string, address: string, hourlyRate: number) {
        super(empId, name, address);
        this.hourlyRate = hourlyRate;
    }

    protected makeClassificastion(): PaymentClassification {
        return new HourlyClassification(this.hourlyRate);
    }

    protected makeSchedule(): PaymentSchedule {
        return new WeeklySchedule();
    }
}

export class AddCommissionedEmployee extends AddEmployeeTransaction {

    private readonly hourlyRate: number;
    private readonly commRate: number;

    constructor(empId: number,
                name: string,
                address: string,
                hourlyRate: number,
                commRate: number) {
        super(empId, name, address);
        this.hourlyRate = hourlyRate;
        this.commRate = commRate;
    }

    protected makeClassification(): PaymentClassification {
        return new CommissionedClassification(this.hourlyRate,
                                              this.commRate);
    }

    protected makeSchedule(): PaymentSchedule {
        return new BiweeklySchedule();
    }
}


export class DeleteEmployee implements Transaction {

    private readonly empId: number;

    constructor(empId: number) {
        this.empId = empId;
    }

    public execute(): void {
        PayrollDatabase.deleteEmployee(this.empId);
    }
}


export class TimeCardTransaction implements Transaction {

    private readonly hours: number;
    private readonly date: Date;
    private readonly empId: number;
    private employee: Employee | undefined;

    constructor(empId: number, date: Date, hours: number) {
        this.hours = hours;
        this.date = date;
        this.empId = empId;
    }

    public execute(): void {
        this.getEmployee();
        if (this.employeeExists()) {
            if (this.isHourlyEmployee()) {
                this.addTimeCardToEmployee();
            } else {
                this.throwEmployeeNotHourly();
            }
        } else {
            this.throwNoSuchEmployee();
        }
    }

    private throwEmployeeNotHourly(): void {
        throw new InvalidOperationException(
            "Tried to add timecard to " +
                "non-hourly employee",
        );
    }

    private isHourlyEmployee(): boolean {
        return this.employee.classification instanceof HourlyClassification;
    }

    private employeeExists(): boolean {
        return typeof this.employee !== 'undefined'
    }

    private throwNoSuchEmployee(): void {
        throw new InvalidOperationException("No such employee.");
    }

    private getEmployee(): Employee | undefined {
        return PayrollDatabase.getEmployee(this.empId);
    }

    private addTimeCardToEmployee(): void {
        const hourlyClassification =
            this.employee.classification as HourlyClassification;
        hourlyClassification.addTimeCard(
            new TimeCard(this.date, this.hours)
        );
    }
}


export class SalesReceiptTransaction implements Transaction {

    private readonly date: Date;
    private readonly amount: number;
    private readonly empId: number;
    private employee: Employee;

    constructor(empId: number, date: Date, amount: number) {
        this.date = date;
        this.amount = amount;
        this.empId = empId
    }

    public execute(): void {
        this.getEmployee();
        if (this.employeeExists()) {
            if (this.isCommissionedEmployee()) {
                this.addSalesReceiptToEmployee();
            } else {
                this.throwEmployeeNotCommissioned();
            }
        } else {
            this.throwNoSuchEmployee();
        }
    }

    private throwNoSuchEmployee(): void {
        throw new InvalidOperationException("No such employee.");
    }

    private throwEmployeeNotCommissioned(): void {
        throw new InvalidOperationException(
            "Tried to add timecard to " +
                "non-commissioned employee",
        );
    }

    private isCommissionedEmployee(): boolean {
        return (this.employee.classification instanceof
                CommissionedClassification);
    }

    private employeeExists(): boolean {
        return typeof this.employee !== 'undefined'
    }

    private getEmployee(): Employee | undefined {
        return PayrollDatabase.getEmployee(this.empId);
    }

    private addSalesReceiptToEmployee(): void {
        const commissionedClassification =
            this.employee.classification as CommissionedClassification;
        commissionedClassification.addSalesReceipt(
            new SalesReceipt(this.date, this.amount)
        );
    }
}


export
