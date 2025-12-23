import { Order } from './order.entity';
import { OrderStatus, OrderStatusVO } from '../value-objects/order-status.vo';

describe('Order Entity', () => {
  const validOrderProps = {
    productId: 'prod-123',
    customerId: 'cust-456',
    sellerId: 'seller-789',
    price: 99.99,
    quantity: 2,
  };

  describe('create', () => {
    it('should create a valid order with Created status', () => {
      const order = Order.create(validOrderProps);

      expect(order).toBeDefined();
      expect(order.productId).toBe(validOrderProps.productId);
      expect(order.customerId).toBe(validOrderProps.customerId);
      expect(order.sellerId).toBe(validOrderProps.sellerId);
      expect(order.price).toBe(validOrderProps.price);
      expect(order.quantity).toBe(validOrderProps.quantity);
      expect(order.status.getValue()).toBe(OrderStatus.CREATED);
      expect(order.getTotalPrice()).toBe(199.98);
    });

    it('should throw error if productId is empty', () => {
      expect(() => Order.create({ ...validOrderProps, productId: '' })).toThrow(
        'Product ID is required',
      );
    });

    it('should throw error if price is negative', () => {
      expect(() => Order.create({ ...validOrderProps, price: -10 })).toThrow(
        'Price must be greater than 0',
      );
    });

    it('should throw error if quantity is not an integer', () => {
      expect(() => Order.create({ ...validOrderProps, quantity: 1.5 })).toThrow(
        'Quantity must be a positive integer',
      );
    });

    it('should emit OrderCreatedEvent when creating new order', () => {
      const order = Order.create(validOrderProps);
      const events = order.getDomainEvents();

      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('order.created');
    });
  });

  describe('updateStatus', () => {
    it('should update status from Created to Accepted', () => {
      const order = Order.create(validOrderProps);
      const acceptedStatus = OrderStatusVO.fromEnum(OrderStatus.ACCEPTED);

      order.updateStatus(acceptedStatus);

      expect(order.status.getValue()).toBe(OrderStatus.ACCEPTED);
    });

    it('should throw error for invalid status transition', () => {
      const order = Order.create(validOrderProps);
      const shippedStatus = OrderStatusVO.fromEnum(OrderStatus.SHIPPED);

      expect(() => order.updateStatus(shippedStatus)).toThrow('Cannot transition');
    });

    it('should emit OrderShippedEvent when status changes to Shipped', () => {
      const order = Order.create(validOrderProps);
      order.clearDomainEvents();

      order.updateStatus(OrderStatusVO.fromEnum(OrderStatus.ACCEPTED));
      order.updateStatus(OrderStatusVO.fromEnum(OrderStatus.SHIPPING_IN_PROGRESS));
      order.updateStatus(OrderStatusVO.fromEnum(OrderStatus.SHIPPED));

      const events = order.getDomainEvents();
      const shippedEvent = events.find((e) => e.eventName === 'order.shipped');

      expect(shippedEvent).toBeDefined();
    });
  });
});
