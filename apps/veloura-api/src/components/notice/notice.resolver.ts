import { Roles } from './../auth/decorators/roles.decorator';
import { RolesGuard } from './../auth/guards/roles.guard';
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { NoticeService } from './notice.service';
import { Notice, Notices } from '../../libs/dto/notice/notice';
import { NoticeInput, NoticeInquiry } from '../../libs/dto/notice/notice.input';
import { UpdateNoticeInput } from '../../libs/dto/notice/notice.update';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { WithoutGuard } from '../auth/guards/without.guard';

@Resolver()
export class NoticeResolver {
	constructor(private readonly noticeService: NoticeService) {}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Notice)
	public async createNotice(@Args('input') input: NoticeInput, @AuthMember('_id') memberId: ObjectId): Promise<Notice> {
		console.log('Mutation: createNotice');
		input.memberId = memberId;
		return await this.noticeService.createNotice(input);
	}

	@Query(() => Notices)
	public async getNotices(@Args('input') input: NoticeInquiry): Promise<Notices> {
		console.log('Query: getNotices', input);
		return await this.noticeService.getNotices(input);
	}

	@Query((returns) => Notice)
	async getNotice(@Args('input') id: string): Promise<Notice> {
		console.log('Query: getNotice', id);
		return this.noticeService.getNotice(id);
	}

	@Mutation(() => Notice)
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	async updateNotice(@Args('input', { type: () => UpdateNoticeInput }) input: UpdateNoticeInput): Promise<Notice> {
		console.log('Mutation: updateNotice');
		return this.noticeService.updateNotice(input);
	}

	@Mutation(() => Notice)
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	async deleteNotice(@Args('input') input: string): Promise<Notice> {
		console.log('Mutation: deleteNotice');
		return this.noticeService.deleteNotice(input);
	}

	@Mutation(() => Notice)
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	async removeNoticePermanently(@Args('input') input: string): Promise<Notice> {
    console.log('Mutation: removeNoticePermanently');
		return this.noticeService.removeNoticePermanently(input);
	}
}