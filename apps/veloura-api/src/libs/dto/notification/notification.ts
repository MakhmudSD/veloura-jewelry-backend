import { Field, ObjectType } from '@nestjs/graphql';
import { NotificationType, NotificationGroup, NotificationStatus } from '../../enums/notification.enum';
import { ObjectId } from 'mongoose';

@ObjectType()
export class Notification {
  @Field(() => String)
  _id: ObjectId;

  @Field(() => NotificationType)
  notificationType: NotificationType;

  @Field(() => NotificationGroup)
  notificationGroup: NotificationGroup;

  @Field(() => NotificationStatus)
  notificationStatus: NotificationStatus;

  @Field(() => String)
  notificationTitle: string;

  @Field(() => String, { nullable: true })
  notificationDesc?: string;

  @Field(() => String)
  receiverId: ObjectId;

  @Field(() => String)
  authorId: ObjectId;

  @Field(() => String, { nullable: true })
  productId?: ObjectId;

  @Field(() => String, { nullable: true })
  articleId?: ObjectId;

  @Field(() => String, { nullable: true })
  commentId?: ObjectId;

  @Field(() => String, { nullable: true })
  refId?: ObjectId;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class Notifications {
  @Field(() => [Notification])
  list: Notification[];

  @Field(() => Number)
  total: number;
}


@ObjectType()
export class DeleteNotificationResult {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  message: string;
}