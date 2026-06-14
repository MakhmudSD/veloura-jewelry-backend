import { ObjectId } from 'bson';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { T } from './types/common';

/** Convert Direction enum string value ('ASC'|'DESC') to MongoDB sort numeric (1|-1) */
export const toMongoDir = (dir: any): 1 | -1 => (dir === 'ASC' || dir === 1) ? 1 : -1;

export const availableStoreSorts = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews', 'memberRank'];
export const availableMemberSorts = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews'];
export const availableProductOptions = ['productBarter',  'productLimited'];
export const availableProductSorts = [
	'createdAt',
	'updatedAt',
	'productLikes',
	'productViews',
	'productRank',
	'productPrice',
];
export const availableBoardArticlesrSorts = ['createdAt', 'updatedAt', 'articleLikes', 'articleViews'];
export const availableNoticesSorts = ['createdAt', 'updatedAt'];
export const availableCommentSorts = ['createdAt', 'updatedAt'];

// IMAGE CONFIGURATION (config.js)

export const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
export const getSerialForImage = (filename: string) => {
	const ext = path.parse(filename).ext;
	return uuidv4() + ext;
};

// SHAPING
export const shapeIntoMongoObjectId = (target: any) => {
	return typeof target === 'string' ? new ObjectId(target) : target;
};

// COMPLEX QUERY
export const lookupAuthMemberLiked = (memberId: T, targetRefId: string = '$_id') => {
	return {
	 $lookup: {
	  from: 'likes',
	  let: { localLikeRefId: targetRefId, localMemberId: memberId, localMyFavorite: true },
	  pipeline: [
	   {
		$match: {
		 $expr: {
		  $and: [{ $eq: ['$likeRefId', '$$localLikeRefId'] }, { $eq: ['$memberId', '$$localMemberId'] }],
		 },
		},
	   },
   
	   {
		$project: {
		 _id: 0,
		 memberId: 1,
		 likeRefId: 1,
		 myFavorite: '$$localMyFavorite',
		},
	   },
	  ],
   
	  as: 'meLiked',
	 },
	};
   };

   interface lookupAuthMemberFollowed {
	followerId: T;
	followingId: string;
}

export const lookupAuthMemberFollowed = (followerId: T, followingId: string) => {
	return {
	 $lookup: {
	  from: 'follows',
	  let: { localFollowerId: followerId, localFollowingId: followingId, localMyFollowing: true },
	  pipeline: [
	   {
		$match: {
		 $expr: {
		  $and: [{ $eq: ['$followerId', '$$localFollowerId'] }, { $eq: ['$followingId', '$$localFollowingId'] }],
		 },
		},
	   },
   
	   {
		$project: {
		 _id: 0,
		 followerId: 1,
		 followingId: 1,
		 myFollowing: '$$localMyFollowing',
		},
	   },
	  ],
   
	  as: 'meFollowed',
	 },
	};
   };

export const lookupMember = {
	$lookup: {
		from: 'members',
		localField: 'memberId',
		foreignField: '_id',
		as: 'memberData',
	},
};

export const lookupFollowingData = {
	$lookup: {
		from: 'members',
		localField: 'followingId',
		foreignField: '_id',
		as: 'followingData',
	},
};

export const lookupFollowerData = {
	$lookup: {
		from: 'members',
		localField: 'followerId',
		foreignField: '_id',
		as: 'followerData',
	},
};

export const lookupFavorite = {
	$lookup: {
		from: 'members',
		localField: 'favoriteProduct.memberId',
		foreignField: '_id',
		as: 'favoriteProduct.memberData',
	},
};

export const lookupVisit = {
	$lookup: {
		from: 'members',
		localField: 'visitedProduct.memberId',
		foreignField: '_id',
		as: 'visitedProduct.memberData',
	},
};
