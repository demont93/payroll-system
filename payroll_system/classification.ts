

export class Classification {}


export class HourlyClassification extends Classification {

    private readonly salary: number;

    constructor(salary: number) {
        super();
        this.salary = salary;
    }
}
