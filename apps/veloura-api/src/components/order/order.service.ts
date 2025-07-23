import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../../libs/dto/orders/order';
import { OrderInquiry, OrderItemInput } from '../../libs/dto/orders/order.input.';
import { OrderStatus } from '../../libs/enums/orders.enum';

@Injectable()
export class OrderService {
  constructor(@InjectModel('Order') private readonly orderModel: Model<Order>) {}

  async getOrders(userId: string): Promise<Order[]> {
    return this.orderModel.find({ memberId: userId }).exec();
  }
  
  async addItemToBasket(userId: string, productId: string, quantity: number): Promise<Order> {
    // Find the user's basket (Order with status PAUSE)
    let basket = await this.orderModel.findOne({ memberId: userId, orderStatus: OrderStatus.PAUSE });
  
    if (!basket) {
      // If no basket exists, create a new one
      basket = new this.orderModel({
        memberId: userId,
        orderItems: [],
        orderTotal: 0,
        orderDelivery: 0,
        orderStatus: OrderStatus.PAUSE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  
    // Check if the product already exists in the basket
    const existingItem = basket.orderItems.find((item) => item.productId === productId);
  
    if (existingItem) {
      // Update the quantity if the product already exists
      existingItem.itemQuantity += quantity;
    } else {
      // Add a new item to the basket
      basket.orderItems.push({ productId, itemQuantity: quantity, itemPrice: 0 }); // Replace 0 with actual price
    }
  
    // Recalculate the total price
    basket.orderTotal = basket.orderItems.reduce(
      (sum, item) => sum + item.itemPrice * item.itemQuantity,
      0,
    );
  
    basket.updatedAt = new Date();
    return basket.save();
  }
    
  
  async updateBasketItem(userId: string, productId: string, quantity: number): Promise<Order> {
    const basket = await this.orderModel.findOne({ memberId: userId, orderStatus: OrderStatus.PAUSE });
  
    if (!basket) {
      throw new Error('Basket not found');
    }
  
    const item = basket.orderItems.find((item) => item.productId === productId);
  
    if (!item) {
      throw new Error('Item not found in basket');
    }
  
    item.itemQuantity = quantity;
  
    basket.orderTotal = basket.orderItems.reduce(
      (sum, item) => sum + item.itemPrice * item.itemQuantity,
      0,
    );
  
    basket.updatedAt = new Date();
    return basket.save();
  }
  
  async removeItemFromBasket(userId: string, productId: string): Promise<Order> {
    const basket = await this.orderModel.findOne({ memberId: userId, orderStatus: OrderStatus.PAUSE });
  
    if (!basket) {
      throw new Error('Basket not found');
    }
  
    basket.orderItems = basket.orderItems.filter((item) => item.productId !== productId);
  
    basket.orderTotal = basket.orderItems.reduce(
      (sum, item) => sum + item.itemPrice * item.itemQuantity,
      0,
    );
  
    basket.updatedAt = new Date();
    return basket.save();
  }
  
  async placeOrder(userId: string): Promise<Order> {
    const basket = await this.orderModel.findOne({ memberId: userId, orderStatus: OrderStatus.PAUSE });
  
    if (!basket) {
      throw new Error('Basket not found');
    }
  
    basket.orderStatus = OrderStatus.PROCESS;
    basket.updatedAt = new Date();
    return basket.save();
  }
}