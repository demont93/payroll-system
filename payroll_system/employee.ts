import { PaymentClassification } from "./payment_classification";
import { PaymentSchedule } from "./payment_schedule";
import { PaymentMethod } from "./payment_method";
import { Affiliation, NoAffiliation } from "./affiliation";


export class Employee {

    private _empId: number;
    private _address: string;
    private _name: string;
    private _classification: PaymentClassification;
    private _schedule: PaymentSchedule;
    private _paymentMethod: PaymentMethod;
    private _affiliation: Affiliation = new NoAffiliation();

    constructor(empId: number,
                name: string,
                address: string,
                classification: PaymentClassification,
                schedule: PaymentSchedule,
                paymentMethod: PaymentMethod) {
        this._empId = empId;
        this._name = name;
        this._address = address;
        this._classification = classification;
        this._schedule = schedule;
        this._paymentMethod = paymentMethod;
    }

    get affiliation(): Affiliation {
        return this._affiliation;
    }

    set affiliation(newAffiliation: Affiliation) {
        this._affiliation = newAffiliation;
    }

    get empId(): number {
        return this._empId;
    }

    get classification(): PaymentClassification {
        return this._classification;
    }

    set classification(pc: PaymentClassification) {
        this._classification = pc;
    }

    get name(): string {
        return this._name;
    }

    set name(name: string) {
        this._name = name;
    }

    get schedule(): PaymentSchedule {
        return this._schedule;
    }

    set schedule(schedule: PaymentSchedule) {
        this._schedule = schedule;
    }

    get paymentMethod(): PaymentMethod {
        return this._paymentMethod;
    }

    set paymentMethod(pm: PaymentMethod) {
        this._paymentMethod = pm;
    }

    get address(): string {
        return this._address;
    }

    set address(address: string) {
        this._address = address;
    }
}
