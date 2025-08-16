import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { FaqService } from './faq.service';
import { MemberType } from '../../libs/enums/member.enum';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Faq } from '../../libs/dto/faq/faq';
import { FaqInput } from '../../libs/dto/faq/faq.input';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateFaqInput } from '../../libs/dto/faq/faq.update';

@Resolver(() => Faq)
export class FaqResolver {
	constructor(private readonly faqService: FaqService) {}

	@Query(() => [Faq])
	getAllFaqs() {
		return this.faqService.findAll();
	}

	@Mutation(() => Faq)
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	createFaq(@Args('input') input: FaqInput) {
		return this.faqService.create(input);
	}

	@Mutation(() => Faq)
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	updateFaq(@Args('input') input: UpdateFaqInput) {
		return this.faqService.update(input);
	}

	@Mutation(() => Boolean)
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	deleteFaq(@Args('id') id: string) {
		return this.faqService.delete(id);
	}
}
