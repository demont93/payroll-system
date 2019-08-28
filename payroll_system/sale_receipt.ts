

export class SaleReceipt {

    private _date: Date;
    private _amount: number;

    constructor(date: Date, amount: number) {
        this._date = date;
        this._amount = amount;
    }

    get date(): Date {
        return this._date;
    }

    get amount(): number {
        return this._amount;
    }
};
