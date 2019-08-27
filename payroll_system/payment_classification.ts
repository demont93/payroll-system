import { TimeCard } from "./time_card";
import { SaleReceipt } from "./sale_receipt";


export class PaymentClassification {}


export class HourlyClassification extends PaymentClassification {

    private readonly _hourlyRate: number;
    private timeCards: Map<Date, TimeCard> = new Map();

    constructor(hourlyRate: number) {
        super();
        this._hourlyRate = hourlyRate;
    }

    get hourlyRate(): number {
        return this._hourlyRate;
    }

    public addTimeCard(timeCard: TimeCard): void {
        this.timeCards.set(timeCard.date, timeCard);
    }

    public getTimeCard(date: Date): TimeCard | undefined {
        return this.timeCards.get(date);;
    }
}


export class CommissionedClassification extends PaymentClassification {

    private readonly _hourlyRate: number;
    private readonly _commissionRate: number;
    private _saleReceipts: Map<Date, SaleReceipt> = new Map();

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

    public addSaleReceipt(saleReceipt: SaleReceipt): void {
        this._saleReceipts.set(saleReceipt.date, saleReceipt);
    }

    public getSaleReceipt(date: Date): SaleReceipt | undefined {
        return this._saleReceipts.get(date);
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
