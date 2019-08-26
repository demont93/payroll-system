require("jasmine");
import { DeleteEmployee, ChangeEmployeeAddress, AddSalariedEmployee } from "../payroll_system/transaction";
import { PayrollDatabase } from "../payroll_system/payroll_database";


describe("TestChangingEmployeeDetails", () => {

    let empId = 2;
    let employee: Employee | undefined;

    beforeEach(() => {
        const addHourlyEmployee = new AddHourlyEmployee(empId,
                                                        "Bill",
                                                        "home",
                                                        15.25);
        addHourlyEmployee.execute();
        employee = PayrollDatabase.getEmployee(empId);
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
        ChangeSalaried.execute();
        expect(employee.classification instanceof SalariedClassification)
            .toBe(true);
        expect(employee.classification.salary).toBe(9.5);
    })

    it("TestChangingAnEmployeeToCommissionedClassification", () => {
        expect(employee.classification instanceof CommissionedClassification)
            .toBe(false);
        const changeCommissioned = new ChangeCommissioned(empId, 9.5, 0.15);
        changeCommissioned.execute();
        expect(employee.classification instanceof CommissionedClassification)
            .toBe(true);
        expect(employee.classification.hourlyRate).toBe(9.5);
        expect(employee.classification.commissionRate).toBe(0.15);
    })

    it("TestChangingAnEmployeeToHourly", () => {
        const addSalariedEmployee = new AddSalariedEmployee(empId, "Bill", "Home", 500,);
        addSalariedEmployee.execute();
        employee = PayrollDatabase.getEmployee(empId);
        expect(employee.classification instanceof HourlyClassification)
            .toBe(false);
        const changeHourly = new ChangeHourly(empId, 9.5);
        changeHourly.execute();
        expect(employee.classification instanceof HourlyClassification)
            .toBe(true);
        expect(employee.classification.hourlyRate).toBe(9.5);
    })

    it("TestChangingAPaymentMethodToHoldCheck", () => {
        employee.paymentMethod = new DirectPaymentMethod();
        expect(employee.paymentMethod instanceof HoldPaymentMethod)
            .toBe(false);
        const changeHoldMethod = new ChangeHoldMethod(empId);
        changeHoldMethod.execute();
        expect(employee.paymentMethod instanceof HoldPaymentMethod)
            .toBe(true);
    })

    it("TestChangingAPaymentMethodToDirect", () => {
        expect(employee.paymentMethod instanceof DirectPaymentMethod)
            .toBe(false);
        const changeDirectMethod = new ChangeDirectMethod(empId);
        changeDirectMethod.execute();
        expect(employee.paymentMethod instanceof DirectPaymentMethod)
            .toBe(true);
    })

    it("TestChangingAPaymentMethodToMail", () => {
        expect(employee.paymentMethod instanceof MailPaymentMethod)
            .toBe(false);
        const changeMailMethod = new ChangeMailMethod(empId);
        changeMailMethod.execute();
        expect(employee.paymentMethod instanceof MailPaymentMethod)
            .toBe(true);
    })
})
