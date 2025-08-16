// src/contact/contact.resolver.ts
import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { ContactService } from './contact.service';
import { ContactModel } from '../../libs/dto/contact/contact.input';
import { CreateContactInput } from '../../libs/dto/contact/contact';


@Resolver(() => ContactModel)
export class ContactResolver {
  constructor(private readonly contactService: ContactService) {}

  @Mutation(() => ContactModel)
  async createContact(
    @Args('createContactInput') createContactInput: CreateContactInput,
  ): Promise<ContactModel> {
    const created = await this.contactService.create(createContactInput);
    return created
  }
  

  @Query(() => [ContactModel])
  async findAllContacts(): Promise<ContactModel[]> {
    return this.contactService.findAll();
  }
  
}
