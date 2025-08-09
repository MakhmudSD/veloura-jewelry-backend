import { registerEnumType } from '@nestjs/graphql';

export enum NotificationType {
	LIKE = 'LIKE',
	COMMENT = 'COMMENT',
	FOLLOW = 'FOLLOW',
	NEW_PRODUCT = 'NEW_PRODUCT',
	ORDER = 'ORDER',           // ✅ add
	NOTICE = 'NOTICE',         // ✅ add (admin site notice)
	MESSAGE = 'MESSAGE',       // ✅ add (admin received a message)
}
registerEnumType(NotificationType, {
	name: 'NotificationType',
});

export enum NotificationStatus {
	WAIT = 'WAIT',
	READ = 'READ',
}
registerEnumType(NotificationStatus, {
	name: 'NotificationStatus',
});

export enum NotificationGroup {
	MEMBER = 'MEMBER',
	ARTICLE = 'ARTICLE',
	PRODUCT = 'PRODUCT',
	COMMENT = 'COMMENT',
}
registerEnumType(NotificationGroup, {
	name: 'NotificationGroup',
});
