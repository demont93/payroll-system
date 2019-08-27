require("jasmine");
import { AddSalariedEmployee, ServiceChargeTransaction } from "../payroll_system/transaction";
import { PayrollDatabase } from "../payroll_system/payroll_database";
import { Employee } from "../payroll_system/employee";
import { UnionAffiliation } from "../payroll_system/affiliation";
import { ServiceCharge } from "../payroll_system/service_charge";


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
        const possibleEmployee = PayrollDatabase.getEmployee(empId);
        expect(possibleEmployee).not.toBeUndefined();
        const employee = possibleEmployee as Employee;

        const unionAffiliation = new UnionAffiliation(45, memberId);
        employee.affiliation = unionAffiliation;
        PayrollDatabase.addUnionMember(memberId, employee.empId);
        const serviceChargeTransaction: ServiceChargeTransaction =
            new ServiceChargeTransaction(memberId, today, 500);
        serviceChargeTransaction.execute();
        const possibleServiceCharge = unionAffiliation.getServiceCharge(today);
        expect(possibleServiceCharge).not.toBeUndefined();
        const serviceCharge = possibleServiceCharge as ServiceCharge;
        expect(serviceCharge.amount).toBe(500);
    })
})

