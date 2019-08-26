

export abstract class PaymentMethod {};


export class HoldMethod extends PaymentMethod {};


export class DirectMethod extends PaymentMethod {};


export class MailMethod extends PaymentMethod {};
