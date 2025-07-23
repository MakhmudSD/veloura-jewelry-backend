import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Order } from '../../libs/dto/orders/order';
import { OrderService } from './order.service';

@Resolver(() => Order)
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  // Hardcoded userId for demo — replace with real auth userId
  private userId = 'user123';

  // Get all orders for the user
  @Query(() => [Order])
  async getOrders() {
    return this.orderService.getOrders(this.userId);
  }

  // Add an item to the basket (order with status PAUSE)
  @Mutation(() => Order)
  async addItemToBasket(
    @Args('productId') productId: string,
    @Args('quantity', { type: () => Number, nullable: true }) quantity?: number,
  ) {
    return this.orderService.addItemToBasket(this.userId, productId, quantity ?? 1);
  }

  // Update the quantity of an item in the basket
  @Mutation(() => Order)
  async updateBasketItem(
    @Args('productId') productId: string,
    @Args('quantity', { type: () => Number }) quantity: number,
  ) {
    return this.orderService.updateBasketItem(this.userId, productId, quantity);
  }

  // Remove an item from the basket
  @Mutation(() => Order)
  async removeItemFromBasket(@Args('productId') productId: string) {
    return this.orderService.removeItemFromBasket(this.userId, productId);
  }

  // Place an order from the basket
  @Mutation(() => Order)
  async placeOrder() {
    return this.orderService.placeOrder(this.userId);
  }
}