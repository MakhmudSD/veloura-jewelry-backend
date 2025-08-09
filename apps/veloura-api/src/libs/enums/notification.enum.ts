import { registerEnumType } from '@nestjs/graphql';

export enum NotificationType {
	LIKE = 'LIKE',
	COMMENT = 'COMMENT',
	FOLLOW = 'FOLLOW',
	NEW_PRODUCT = 'NEW_PRODUCT',
	ORDER = 'ORDER',           
	NOTICE = 'NOTICE',
	MESSAGE = 'MESSAGE',       
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
	NOTICE = 'NOTICE'
}
registerEnumType(NotificationGroup, {
	name: 'NotificationGroup',
});
