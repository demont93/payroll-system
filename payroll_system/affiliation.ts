import { ServiceCharge } from "./service_charge";


export abstract class Affiliation {};


export class NoAffiliation extends Affiliation {}


export class UnionAffiliation extends Affiliation {

    private serviceCharges: Map<Date, ServiceCharge> = new Map();
    private _dues: number;
    private _memberId: number;

    constructor(dues: number, memberId: number) {
        super();
        this._dues = dues;
        this._memberId = memberId;
    }

    public addServiceCharge(serviceCharge: ServiceCharge): void {
        this.serviceCharges.set(serviceCharge.date, serviceCharge);
    }

    public getServiceCharge(date: Date): ServiceCharge | undefined {
        return this.serviceCharges.get(date);
    }

    get dues(): number {
        return this._dues;
    }

    get memberId(): number {
        return this._memberId;
    }
};
