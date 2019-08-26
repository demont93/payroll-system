import { PaymentClassification } from "./payment_classification";
import { PaymentSchedule } from "./payment_schedule";
import { PaymentMethod } from "./payment_method";


export class Employee {

    private _empId: number;
    private _classification: PaymentClassification;
    private _name: string;
    private _schedule: PaymentSchedule;
    private _paymentMethod: PaymentMethod;

    constructor(empId: number,
                paymentClassification: PaymentClassification,
                paymentSchedule: PaymentSchedule,
                paymentMethod: PaymentMethod) {
        this._empId = empId;
        this._classification = paymentClassification;
        this._name = name;
        this._schedule = paymentSchedule;
        this._paymentMethod = paymentMethod;
    }

    get empId(): number {
        return this._empId;
    }

    get classification(): PaymentClassification {
        return this._classification;
    }

    get name(): string {
        return this._name;
    }

    get schedule(): PaymentSchedule {
        return this._schedule;
    }

    get paymentMethod(): PaymentMethod {
        return this._paymentMethod;
    }
}
