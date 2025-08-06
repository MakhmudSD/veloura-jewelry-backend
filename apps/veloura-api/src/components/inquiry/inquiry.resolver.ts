// src/component/inquiry/inquiry.resolver.ts
import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { InquiryService } from './inquiry.service';
import { UseGuards } from '@nestjs/common';
import { CreateInquiryInput, InquiryOutput, ReplyInquiryInput,  } from '../../libs/dto/inquiry/inquiry';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { MemberType } from '../../libs/enums/member.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from '../auth/guards/auth.guard';


@Resolver(() => InquiryOutput)
export class InquiryResolver {
  constructor(private readonly inquiryService: InquiryService) {}

  @Mutation(() => InquiryOutput)
  @Roles(MemberType.USER, MemberType.STORE)
  @UseGuards(RolesGuard)
  async createInquiry(
    @Args('input') input: CreateInquiryInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<InquiryOutput> {
    const inputWithMemberId = { ...input, memberId };
    const result = await this.inquiryService.createInquiry(inputWithMemberId);
    return result.toObject(); // or just return if types match
  }

  @Query(() => [InquiryOutput])
  @UseGuards(AuthGuard)
  async getInquiries(): Promise<InquiryOutput[]> {
    const result = await this.inquiryService.getInquiries();
    return result as unknown as InquiryOutput[]; // Ensure conversion to InquiryOutput
  }

  @Mutation(() => InquiryOutput)
  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  async replyToInquiry(
    @Args('input') input: ReplyInquiryInput,
  ): Promise<InquiryOutput> {
    const inquiry = await this.inquiryService.replyToInquiry(input);
    return inquiry.toObject(); // Ensure conversion to InquiryOutput
  }
  
}
