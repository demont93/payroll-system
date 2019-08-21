require("jasmine");
import { AddHourlyEmployee, DeleteEmployee } from "../payroll_system/transaction";
import { PayrollDatabase } from "../payroll_system/payroll_database";
import { Employee } from "../payroll_system/employee";


describe("testDeleteEmployee", () => {

    it("deleteEmployee", () => {
        const empId: number = 4;

        const addHourlyEmployee: AddHourlyEmployee = new AddHourlyEmployee(
            4,
            "Bob",
            "Address 1",
            9.50
        );
        addHourlyEmployee.execute();
        let employee: Employee | undefined = PayrollDatabase.getEmployee(empId);
        expect(employee).not.toBeUndefined();

        const deleteEmployee: DeleteEmployee = new DeleteEmployee(empId);
        deleteEmployee.execute();

        employee = PayrollDatabase.getEmployee(empId);
        expect(employee).toBeUndefined();
    });
});
