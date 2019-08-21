

export class TimeCard {

    private readonly _date: Date;
    private readonly _hours: number;

    constructor(date: Date, hours, number) {
        this._date = date;
        this._hours = hours;
    }

    get date(): Date {
        return this._date;
    }

    get hours(): number {
        return this._hours;
    }
}
