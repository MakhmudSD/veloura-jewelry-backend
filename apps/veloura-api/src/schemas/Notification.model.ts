import { Schema } from 'mongoose';
import { NotificationGroup, NotificationStatus, NotificationType } from '../libs/enums/notification.enum';

const NotificationSchema = new Schema(
  {
    notificationType: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },

    notificationStatus: {
      type: String,
      enum: Object.values(NotificationStatus),
      default: NotificationStatus.WAIT,
    },

    notificationGroup: {
      type: String,
      enum: Object.values(NotificationGroup),
      required: true,
    },

    notificationTitle: {
      type: String,
      required: true,
      trim: true,
    },

    notificationDesc: {
      type: String,
      trim: true,
    },

    authorId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Member',
    },

    receiverId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Member',
    },

    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },

    articleId: {
      type: Schema.Types.ObjectId,
      ref: 'BoardArticle',
    },

    commentId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },

    refId: {
      type: Schema.Types.ObjectId,
    },
  },
  { timestamps: true, collection: 'notifications' },
);

// ✅ Virtuals for population
NotificationSchema.virtual('authorData', {
  ref: 'Member',
  localField: 'authorId',
  foreignField: '_id',
  justOne: true,
});

NotificationSchema.virtual('receiverData', {
  ref: 'Member',
  localField: 'receiverId',
  foreignField: '_id',
  justOne: true,
});

NotificationSchema.set('toObject', { virtuals: true });
NotificationSchema.set('toJSON', { virtuals: true });

NotificationSchema.index(
  { receiverId: 1, authorId: 1, notificationType: 1, createdAt: -1 },
  { name: 'notif_dedupe_hint' }
);
NotificationSchema.index({ receiverId: 1, createdAt: -1 });


export default NotificationSchema;
