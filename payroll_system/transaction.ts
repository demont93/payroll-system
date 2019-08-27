import { PayrollDatabase } from "./payroll_database";
import { MailMethod, DirectMethod } from "./payment_method";
import { ServiceCharge } from "./service_charge";
import { SaleReceipt } from "./sale_receipt";
import { TimeCard } from "./time_card";
import { InvalidOperationException } from "./exceptions";
import { HourlyClassification, PaymentClassification, SalariedClassification, CommissionedClassification } from "./payment_classification";
import { PaymentMethod, HoldMethod } from "./payment_method";
import { PaymentSchedule, MonthlySchedule, WeeklySchedule, BiweeklySchedule } from "./payment_schedule";
import { Employee } from "./employee";
import { UnionAffiliation, Affiliation, NoAffiliation } from "./affiliation";


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
        this.validate();
    }

    public execute(): void {
        const paymentSchedule: PaymentSchedule = this.makeSchedule();
        const paymentClassification: PaymentClassification =
            this.makeClassification();
        const paymentMethod: PaymentMethod = new HoldMethod();

        const employee: Employee = new Employee(this.empId,
                                                this.name,
                                                this.address,
                                                paymentClassification,
                                                paymentSchedule,
                                                paymentMethod);
        PayrollDatabase.addEmployee(this.empId, employee)
    }

    protected validate(): void {
        this.validateEmployeeUnique();
        this.validateParams();
    }

    protected abstract validateParams(): void;

    protected abstract makeClassification(): PaymentClassification;

    protected abstract makeSchedule(): PaymentSchedule;

    private validateEmployeeUnique(): void {
        if (typeof PayrollDatabase.getEmployee(this.empId) !== "undefined") {
            throw new Error("Employee already exists with this ID");
        }
    }
}


export class AddSalariedEmployee extends AddEmployeeTransaction {

    private readonly salary: number;

    constructor(empId: number, name: string, address: string, salary: number) {
        super(empId, name, address);
        this.salary = salary;
    }

    protected validateParams(): void {
        if (this.salary < 0) {
            throw new InvalidOperationException("Salary can't be negative");
        }
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

    protected makeClassification(): PaymentClassification {
        return new HourlyClassification(this.hourlyRate);
    }

    protected validateParams(): void {
        if (this.hourlyRate < 0) {
            throw new InvalidOperationException("Hourly rate can't be negative");
        }
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

    protected validateParams(): void {
        if (this.commRate < 0) {
            throw new InvalidOperationException("Commission rate can't be negative");
        }
        if (this.hourlyRate < 0) {
            throw new InvalidOperationException("Hourly rate can't be negative");
        }
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
    private employee: Employee;

    constructor(empId: number, date: Date, hours: number) {
        this.hours = hours;
        this.date = date;
        this.empId = empId;
        this.validateAndSet();
    }

    public execute(): void {
        this.addTimeCardToEmployee();
    }

    private validateAndSet(): void {
        const dbResult = this.getEmployee();
        this.checkEmployeeExists(dbResult);
        const employee = dbResult as Employee;
        this.checkIsHourlyEmployee(employee);
        this.employee = employee;
    }

    private throwEmployeeNotHourly(): void {
        throw new InvalidOperationException(
            "Tried to add timecard to " +
                "non-hourly employee",
        );
    }

    private checkIsHourlyEmployee(employee: Employee): void {
        if (!(employee.classification instanceof HourlyClassification)) {
            this.throwEmployeeNotHourly();
        }
    }

    private checkEmployeeExists(employee: Employee | undefined): void {
        if (typeof employee === 'undefined') {
            this.throwNoSuchEmployee();
        }
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


export class SaleReceiptTransaction implements Transaction {

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
        if (this.isCommissionedEmployee()) {
            this.addSalesReceiptToEmployee();
        } else {
            this.throwEmployeeNotCommissioned();
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

private employeeExists(possibleEmployee: Employee | undefined): boolean {
        return typeof possibleEmployee !== 'undefined'
    }

    private getEmployee(): void {
        const possibleEmployee = PayrollDatabase.getEmployee(this.empId);
        if (this.employeeExists(possibleEmployee)) {
            this.employee = possibleEmployee as Employee;
        } else {
            this.throwNoSuchEmployee();
        }
    }

    private addSalesReceiptToEmployee(): void {
        const commissionedClassification =
            this.employee.classification as CommissionedClassification;
        commissionedClassification.addSaleReceipt(
            new SaleReceipt(this.date, this.amount)
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
            this.employee = employee as Employee;
        } else {
            this.throwNoSuchEmployee();
        }
    }

    private addServiceChargeToEmployee(): void {
        const serviceCharge = new ServiceCharge(this.date, this.amount);
        const unionAffiliation = this.employee.affiliation as UnionAffiliation;
        unionAffiliation.addServiceCharge(serviceCharge);
    }
}

export abstract class ChangeEmployeeTransaction implements Transaction {

    private readonly empId: number;
    protected employee: Employee;

    constructor(empId: number) {
        this.empId = empId;
        this.validateEmployee();
    }

    public execute(): void {
        this.change();
    };

    private validateEmployee(): void {
        this.getEmployee();
    }

    private getEmployee() {
        const possibleEmployee = PayrollDatabase.getEmployee(this.empId);
        if (this.employeeExists(possibleEmployee)) {
            this.employee = possibleEmployee as Employee;
        } else {
            this.throwNoSuchEmployee();
        }
    }

    private throwNoSuchEmployee(): void {
        throw new InvalidOperationException("No such employee.");
    }

    private employeeExists(employee: Employee | undefined): boolean {
        return typeof employee !== "undefined";
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
        this.employee.paymentMethod = this.method();
    }

    protected abstract method(): PaymentMethod;
}


export class ChangeMailMethod extends ChangeMethod {

    protected method(): PaymentMethod {
        return new MailMethod();
    }
}


export class ChangeDirectMethod extends ChangeMethod {

    protected method(): PaymentMethod {
        return new DirectMethod();
    }
}


export class ChangeHoldMethod extends ChangeMethod {

    protected method(): PaymentMethod {
        return new HoldMethod();
    }
}


export abstract class ChangeAffiliation extends ChangeEmployeeTransaction {

    protected change(): void {
        this.recordMembership();
        this.employee.affiliation = this.newAffiliation;
    }

    protected abstract get newAffiliation(): Affiliation;

    protected abstract recordMembership(): void;
}


export class ChangeAffiliationAdd extends ChangeAffiliation {

    private readonly _memberId: number;
    private readonly _dues: number;

    constructor(empId: number, memberId: number, dues: number) {
        super(empId);
        this._memberId = memberId;
        this._dues = dues;
        this.validateParams();
    }

    protected get newAffiliation(): Affiliation {
        return new UnionAffiliation(this._dues, this._memberId);
    }

    protected recordMembership(): void {
        PayrollDatabase.addUnionMember(this._memberId, this.employee.empId)
    }

    private validateParams(): void {
        if (this._dues < 0) {
            throw new InvalidOperationException("Dues can't be negative");
        }
        if (typeof PayrollDatabase.getUnionMember(this._memberId)
            !== "undefined") {
            throw new InvalidOperationException("Member already exists");
        }
    }
}


export class ChangeAffiliationRemove extends ChangeAffiliation {

    protected get newAffiliation(): Affiliation {
        return new NoAffiliation();
    }

    protected recordMembership(): void {
        const unionAffiliation = this.employee.affiliation as UnionAffiliation;
        PayrollDatabase.deleteUnionMember(unionAffiliation.memberId);
    }
}
