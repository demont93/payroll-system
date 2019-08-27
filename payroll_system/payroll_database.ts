import { Employee } from "./employee";


export class PayrollDatabase {

    private static employees: Map<number, Employee> = new Map();
    private static memberUnion: Map<number, number> = new Map();

    public static addEmployee(id: number, employee: Employee): void {
        PayrollDatabase.employees.set(id, employee);
    }

    public static deleteEmployee(empId: number): void {
        PayrollDatabase.employees.delete(empId);
    }

    public static getEmployee(id: number): Employee | undefined {
        return PayrollDatabase.employees.get(id);
    }

    public static getUnionMember(memberId: number): Employee | undefined {
        let empId = PayrollDatabase.memberUnion.get(memberId);
        if (typeof empId !== "undefined") {
            return PayrollDatabase.getEmployee(empId);
        } else {
            return undefined;
        }
    }

    public static addUnionMember(memberId: number, empId: number): void {
        PayrollDatabase.memberUnion.set(memberId, empId);
    }

    public static deleteUnionMember(memberId: number): void {
        PayrollDatabase.memberUnion.delete(memberId);
    }
}
