

export class PaymentClassification {}


export class HourlyClassification extends PaymentClassification {

    private readonly _hourlyRate: number;

    constructor(hourlyRate: number) {
        super();
        this._hourlyRate = hourlyRate;
    }

    get hourlyRate(): number {
        return this._hourlyRate;
    }
}


export class CommissionedClassification extends PaymentClassification {

    private readonly _hourlyRate: number;
    private readonly _commissionRate: number;

    constructor(hourlyRate: number, commissionRate: number) {
        super();
        this._hourlyRate = hourlyRate;
        this._commissionRate = commissionRate;
    }

    get hourlyRate(): number {
        return this._hourlyRate;
    }

    get commissionRate(): number {
        return this._commissionRate;
    }
}


export class SalariedClassification extends PaymentClassification {

    private readonly _salary: number;

    constructor(salary: number) {
        super();
        this._salary = salary;
    }

    get salary(): number {
        return this._salary;
    }
}
