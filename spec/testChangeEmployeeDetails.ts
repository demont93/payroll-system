require("jasmine");
import { DeleteEmployee, ChangeEmployeeAddress, AddSalariedEmployee, ChangeEmployeeName, ChangeSalaried, ChangeCommissioned, ChangeHourly, ChangeHoldMethod, ChangeDirectMethod, ChangeMailMethod, ChangeAffiliationAdd, ChangeAffiliationRemove } from "../payroll_system/transaction";
import { PayrollDatabase } from "../payroll_system/payroll_database";
import { Employee } from "../payroll_system/employee";
import { AddHourlyEmployee } from "../payroll_system/transaction";
import { SalariedClassification, CommissionedClassification, HourlyClassification } from "../payroll_system/payment_classification";
import { DirectMethod, HoldMethod, MailMethod } from "../payroll_system/payment_method";
import { UnionAffiliation, NoAffiliation } from "../payroll_system/affiliation";


describe("TestChangingEmployeeDetails", () => {

    let empId = 234333;
    let employee: Employee;

    beforeEach(() => {
        const addHourlyEmployee = new AddHourlyEmployee(empId,
                                                        "Bill",
                                                        "home",
                                                        15.25);
        addHourlyEmployee.execute();
        const possibleEmployee = PayrollDatabase.getEmployee(empId);
        expect(possibleEmployee).not.toBeUndefined();
        employee = possibleEmployee as Employee;
    });

    afterEach(() => {
        const deleteEmployeeTransaction = new DeleteEmployee(empId);
        deleteEmployeeTransaction.execute();
    });

    it("TestChangingAnEmployeeName", () => {
        const changeNameTransaction = new ChangeEmployeeName(
            empId,
            "John"
        );
        changeNameTransaction.execute();
        expect(employee.name).toBe("John");
    });

    it("TestChangingAnEmployeeAddress", () => {
        const changeEmployeeAddress = new ChangeEmployeeAddress(empId, "New Home");
        changeEmployeeAddress.execute();
        expect(employee.address).toBe("New Home");
    })

    it("TestChangingAnEmployeeToSalariedClassification", () => {
        expect(employee.classification instanceof SalariedClassification)
            .toBe(false);
        const changeSalaried = new ChangeSalaried(empId, 9.5);
        changeSalaried.execute();
        expect(employee.classification instanceof SalariedClassification)
            .toBe(true);
        const salariedClassification = employee.classification as SalariedClassification;
        expect(salariedClassification.salary).toBe(9.5);
    })

    it("TestChangingAnEmployeeToCommissionedClassification", () => {
        expect(employee.classification instanceof CommissionedClassification)
            .toBe(false);
        const changeCommissioned = new ChangeCommissioned(empId, 9.5, 0.15);
        changeCommissioned.execute();
        expect(employee.classification instanceof CommissionedClassification)
            .toBe(true);
        const commissionedClassification =
            employee.classification as CommissionedClassification;
        expect(commissionedClassification.hourlyRate).toBe(9.5);
        expect(commissionedClassification.commissionRate).toBe(0.15);
    })

    it("TestChangingAnEmployeeToHourly", () => {
        const deleteEmployee = new DeleteEmployee(empId);
        deleteEmployee.execute();
        const addSalariedEmployee = new AddSalariedEmployee(empId, "Bill", "Home", 500,);
        addSalariedEmployee.execute();
        const possibleEmployee = PayrollDatabase.getEmployee(empId);
        expect(possibleEmployee).not.toBeUndefined();
        employee = possibleEmployee as Employee;
        expect(employee.classification instanceof HourlyClassification)
            .toBe(false);
        const changeHourly = new ChangeHourly(empId, 9.5);
        changeHourly.execute();
        expect(employee.classification instanceof HourlyClassification)
            .toBe(true);
        const hourlyClassification = employee.classification as HourlyClassification;
        expect(hourlyClassification.hourlyRate).toBe(9.5);
    });

    it("TestChangingAPaymentMethodToHoldCheck", () => {
        employee.paymentMethod = new DirectMethod();
        expect(employee.paymentMethod instanceof HoldMethod)
            .toBe(false);
        const changeHoldMethod = new ChangeHoldMethod(empId);
        changeHoldMethod.execute();
        expect(employee.paymentMethod instanceof HoldMethod)
            .toBe(true);
    });

    it("TestChangingAPaymentMethodToDirect", () => {
        expect(employee.paymentMethod instanceof DirectMethod)
            .toBe(false);
        const changeDirectMethod = new ChangeDirectMethod(empId);
        changeDirectMethod.execute();
        expect(employee.paymentMethod instanceof DirectMethod)
            .toBe(true);
    });

    it("TestChangingAPaymentMethodToMail", () => {
        expect(employee.paymentMethod instanceof MailMethod)
            .toBe(false);
        const changeMailMethod = new ChangeMailMethod(empId);
        changeMailMethod.execute();
        expect(employee.paymentMethod instanceof MailMethod)
            .toBe(true);
    });

    it("TestAddRemoveAffiliationToEmployee", () => {
        const memberId = 2343333;
        expect(employee.affiliation instanceof NoAffiliation).toBe(true);
        expect(PayrollDatabase.getUnionMember(memberId)).toBeUndefined();
        const addAffiliationTransaction = new ChangeAffiliationAdd(
            empId,
            memberId,
            239
        );
        addAffiliationTransaction.execute();
        expect(employee.affiliation instanceof UnionAffiliation).toBe(true);
        expect(PayrollDatabase.getUnionMember(memberId)).not.toBeUndefined();
        expect(PayrollDatabase.getUnionMember(memberId)).toBe(employee);
        const unionAffiliation = employee.affiliation as UnionAffiliation;
        expect(unionAffiliation.dues).toBe(239);
        const changeAffiliationRemove = new ChangeAffiliationRemove(empId);
        changeAffiliationRemove.execute();
        expect(employee.affiliation instanceof NoAffiliation).toBe(true);
        expect(PayrollDatabase.getUnionMember(memberId)).toBeUndefined();
    });
})
