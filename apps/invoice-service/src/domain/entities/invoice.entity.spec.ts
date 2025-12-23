import { Invoice } from './invoice.entity';

describe('Invoice Entity', () => {
  const validInvoiceProps = {
    orderId: 'order-123',
    pdfPath: '/uploads/invoice.pdf',
  };

  describe('create', () => {
    it('should create a valid invoice', () => {
      const invoice = Invoice.create(validInvoiceProps);

      expect(invoice).toBeDefined();
      expect(invoice.orderId).toBe(validInvoiceProps.orderId);
      expect(invoice.pdfPath).toBe(validInvoiceProps.pdfPath);
      expect(invoice.sentAt).toBeNull();
      expect(invoice.isSent()).toBe(false);
    });

    it('should throw error if orderId is empty', () => {
      expect(() => Invoice.create({ ...validInvoiceProps, orderId: '' })).toThrow(
        'Order ID is required',
      );
    });

    it('should throw error if pdfPath is empty', () => {
      expect(() => Invoice.create({ ...validInvoiceProps, pdfPath: '' })).toThrow(
        'PDF path is required',
      );
    });
  });

  describe('markAsSent', () => {
    it('should mark invoice as sent', () => {
      const invoice = Invoice.create(validInvoiceProps);

      invoice.markAsSent();

      expect(invoice.isSent()).toBe(true);
      expect(invoice.sentAt).toBeInstanceOf(Date);
    });

    it('should emit InvoiceSentEvent when marked as sent', () => {
      const invoice = Invoice.create(validInvoiceProps);

      invoice.markAsSent();

      const events = invoice.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('invoice.sent');
    });

    it('should throw error if already sent', () => {
      const invoice = Invoice.create(validInvoiceProps);
      invoice.markAsSent();

      expect(() => invoice.markAsSent()).toThrow('Invoice has already been sent');
    });
  });
});
