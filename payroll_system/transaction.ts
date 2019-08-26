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

export class ServiceChargeTransaction implements Transaction {

    private readonly date: Date;
    private readonly amount: number;
    private readonly memberId: number;
    private employee: Employee;

    constructor(memberId: number, date: Date, amount: number) {
        this.date = date;
        this.amount = amount;
        this.memberId = memberId;
    }

    public execute(): void {
        this.getUnionMember();
        if (this.affiliationIsUnionAffiliation()) {
            this.addServiceChargeToEmployee();
        } else {
            this.throwNoUnionAffiliation();
        }
    }

    private throwNoSuchEmployee(): void {
        throw new InvalidOperationException("No such employee.");
    }

    private affiliationIsUnionAffiliation(): boolean {
        return this.employee.affiliation instanceof UnionAffiliation;
    }

    private throwNoUnionAffiliation(): void {
        throw new InvalidOperationException(
            "Tried to add service charge to union member without a union " +
                "affiliation"
        );
    }

    private employeeExists(employee: Employee | undefined): boolean {
        return typeof employee !== 'undefined';
    }

    private getUnionMember() {
        const employee: Employee | undefined =
            PayrollDatabase.getUnionMember(this.memberId);
        if (this.employeeExists(employee)) {
            this.employee = employee;
        } else {
            this.throwNoSuchEmployee();
        }
    }

    private addServiceChargeToEmployee(): void {
        const serviceCharge = new ServiceCharge(this.date, this.amount);
        this.employee.affiliation.addServiceCharge(serviceCharge);
    }
}

export abstract class ChangeEmployeeTransaction implements Transaction {

    private readonly empId: number;
    protected employee: Employee;

    constructor(empId: number) {
        this.empId = empId;
    }

    public execute(): void {
        this.employee = PayrollDatabase.getEmployee(this.empId);
        this.getEmployee();
        this.change();
    };

    private getEmployee(): void {
        const employee = PayrollDatabase.getEmployee(this.empId);
        if (typeof employee !== undefined) {
            this.employee = employee;
        } else {
            this.throwNoSuchEmployee()
        }
    }

    private throwNoSuchEmployee(): void {
        throw new InvalidOperationException("No such employee.");
    }

    protected abstract change(): void;
}


export class ChangeEmployeeName extends ChangeEmployeeTransaction {

    private readonly name: string;

    constructor(empId: number, name: string) {
        super(empId);
        this.name = name;
    }

    protected change(): void {
        this.employee.name = this.name;
    }
}


export class ChangeEmployeeAddress extends ChangeEmployeeTransaction {

    private readonly address: string;

    constructor(empId: number, address: string) {
        super(empId);
        this.address = address;
    }

    protected change(): void {
        this.employee.address = this.address
    }
}

export abstract class ChangeClassification extends ChangeEmployeeTransaction {

    protected change(): void {
        this.employee.classification = this.getClassification();
        this.employee.schedule = this.getSchedule();
    }

    protected abstract getClassification(): PaymentClassification;

    protected abstract getSchedule(): PaymentSchedule;
}

export class ChangeHourly extends ChangeClassification {

    private readonly hourlyRate: number;

    constructor(empId: number, hourlyRate: number) {
        super(empId);
        this.hourlyRate = hourlyRate;
    }

    protected getClassification(): PaymentClassification {
        return new HourlyClassification(this.hourlyRate);
    }

    protected getSchedule(): PaymentSchedule {
        return new WeeklySchedule();
    }
}


export class ChangeCommissioned extends ChangeClassification {

    private readonly hourlyRate: number;
    private readonly commissionRate: number;

    constructor(empId: number, hourlyRate: number, commissionRate: number) {
        super(empId);
        this.hourlyRate = hourlyRate;
        this.commissionRate = commissionRate;
    }

    protected getClassification(): PaymentClassification {
        return new CommissionedClassification(this.hourlyRate, this.commissionRate);
    }

    protected getSchedule(): PaymentSchedule {
        return new BiweeklySchedule();
    }
}

export class ChangeSalaried extends ChangeClassification {

    private readonly salary: number;

    constructor(empId: number, salary: number) {
        super(empId);
        this.salary = salary;
    }

    protected getClassification(): PaymentClassification {
        return new SalariedClassification(this.salary);
    }

    protected getSchedule(): PaymentSchedule {
        return new MonthlySchedule();
    }
}


export abstract class ChangeMethod extends ChangeEmployeeTransaction {

    protected change(): void {
        this.employee.paymentMethod = this.method;
    }

    protected abstract method(): PaymentMethod;
}


export class ChangeMailMethod extends ChangeMethod {

    protected method(): PaymentMethod {
        return new MailPaymentMethod();
    }
}


export class ChangeDirectMethod extends ChangeMethod {

    protected method(): PaymentMethod {
        return new DirectPaymentMethod();
    }
}


export class ChangeHoldMethod extends ChangeMethod {

    protected method(): PaymentMethod {
        return new MailPaymentMethod();
    }
}

