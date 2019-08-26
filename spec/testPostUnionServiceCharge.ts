require("jasmine");
import { AddSalariedEmployee, ServiceChargeTransaction } from "../payroll_system/transaction";
import { PayrollDatabase } from "../payroll_system/payroll_database";


describe("testPostServiceChargeTransaction", () => {

    it("postServiceChargeTransaction", () => {
        const empId: number = 8;
        const memberId: number = 9;
        const today: Date = new Date();
        const addSalariedEmployee: AddSalariedEmployee =
            new AddSalariedEmployee(empId,
                                    "Ron",
                                    "456 the new Address",
                                    1500);
        addSalariedEmployee.execute();
        const employee: Employee | undefined =
            PayrollDatabase.getEmployee(empId);
        expect(employee).not.toBeUndefined();

        const unionAffiliation: UnionAffiliation =
            new UnionAffiliation();
        employee.affiliation = unionAffiliation;
        PayrollDatabase.addUnionMember(memberId, employee);
        const serviceChargeTransaction: ServiceChargeTransaction =
            new ServiceChargeTransaction(memberId, today, 500);
        serviceChargeTransaction.execute();
        const serviceCharge: ServiceCharge | undefined =
            unionAffiliation.getServiceCharge(today);
        expect(serviceCharge).not.toBeUndefined();
        expect(serviceCharge.amount).toBe(500);
    })
})

