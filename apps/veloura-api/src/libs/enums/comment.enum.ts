import { registerEnumType } from '@nestjs/graphql';
import { NotificationGroup } from './notification.enum';

export enum CommentStatus {
  ACTIVE = 'ACTIVE',
  DELETE = 'DELETE',
}
registerEnumType(CommentStatus, {
  name: 'CommentStatus',
});

export enum CommentGroup {
  MEMBER = 'MEMBER',
  ARTICLE = 'ARTICLE',
  PRODUCT = 'PRODUCT',
}
registerEnumType(CommentGroup, {
  name: 'CommentGroup',
});

// ✅ This is fine: just a plain JS map
export const commentToNotificationGroupMap: Record<CommentGroup, NotificationGroup> = {
  [CommentGroup.PRODUCT]: NotificationGroup.PRODUCT,
  [CommentGroup.ARTICLE]: NotificationGroup.ARTICLE,
  [CommentGroup.MEMBER]: NotificationGroup.MEMBER,
};

// ❌ Do NOT register the map — not needed
// registerEnumType(commentToNotificationGroupMap, { ... })  // REMOVE THIS
