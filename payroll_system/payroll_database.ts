import { Employee } from "./employee";


export class PayrollDatabase {

    private static employees: Map<number, Employee> = new Map();

    public static addEmployee(id: number, employee: Employee): void {
        this.employees.set(id, employee);
    }

    public static deleteEmployee(empId: number): void {
        this.employees.delete(empId);
    }

    public static getEmployee(id: number): Employee | undefined {
        return this.employees.get(id);
    }
}
