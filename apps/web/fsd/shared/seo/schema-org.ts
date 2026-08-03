import type {
  Action,
  AggregateOffer,
  AggregateRating,
  Article,
  Audience,
  BreadcrumbList,
  CategoryCode,
  CollectionPage,
  ComicIssue,
  ComicSeries,
  Comment,
  CommentAction,
  CreativeWork,
  DiscussionForumPosting,
  EntryPoint,
  ImageObject,
  InteractionCounter,
  ItemList,
  LikeAction,
  ListItem,
  Offer,
  Organization,
  Person,
  ProfilePage,
  SearchAction,
  SpeakableSpecification,
  Thing,
  ViewAction,
  WebPage,
  WebSite,
  WithContext,
} from 'schema-dts';

class SchemaBuilder<T extends Thing> {
  protected schema: T & { '@context': 'https://schema.org'; '@type': string };

  constructor(type: string) {
    this.schema = {
      '@context': 'https://schema.org',
      '@type': type,
    } as T & { '@context': 'https://schema.org'; '@type': string };
  }

  set(obj: Partial<T>): this {
    // @ts-ignore
    this.schema = { ...this.schema, ...obj };
    return this;
  }

  build(): WithContext<T> {
    return this.schema;
  }
}

class PersonBuilder extends SchemaBuilder<Person> {
  constructor() {
    super('Person');
  }
}

class OrganizationBuilder extends SchemaBuilder<Organization> {
  constructor() {
    super('Organization');
  }
}

class ImageObjectBuilder extends SchemaBuilder<ImageObject> {
  constructor() {
    super('ImageObject');
  }
}

class AggregateRatingBuilder extends SchemaBuilder<AggregateRating> {
  constructor() {
    super('AggregateRating');
  }
}

class AudienceBuilder extends SchemaBuilder<Audience> {
  constructor() {
    super('Audience');
  }
}

class ComicIssueBuilder extends SchemaBuilder<ComicIssue> {
  constructor() {
    super('ComicIssue');
  }
}

class CommentBuilder extends SchemaBuilder<Comment> {
  constructor() {
    super('Comment');
  }
}

class ComicSeriesBuilder extends SchemaBuilder<ComicSeries> {
  constructor() {
    super('ComicSeries');
  }
}

class BreadcrumbListBuilder extends SchemaBuilder<BreadcrumbList> {
  constructor() {
    super('BreadcrumbList');
  }
}

class ListItemBuilder extends SchemaBuilder<ListItem> {
  constructor() {
    super('ListItem');
  }
}

class DiscussionForumPostingBuilder extends SchemaBuilder<DiscussionForumPosting> {
  constructor() {
    super('DiscussionForumPosting');
  }
}

class InteractionCounterBuilder extends SchemaBuilder<InteractionCounter> {
  constructor() {
    super('InteractionCounter');
  }
}

class CommentActionBuilder extends SchemaBuilder<CommentAction> {
  constructor() {
    super('CommentAction');
  }
}

class WebPageElementBuilder extends SchemaBuilder<Thing> {
  constructor() {
    super('WebPageElement');
  }
}

class WebPageBuilder extends SchemaBuilder<WebPage> {
  constructor() {
    super('WebPage');
  }
}

class SearchActionBuilder extends SchemaBuilder<SearchAction> {
  constructor() {
    super('SearchAction');
  }
}

class EntryPointBuilder extends SchemaBuilder<EntryPoint> {
  constructor() {
    super('EntryPoint');
  }
}

class LikeActionBuilder extends SchemaBuilder<LikeAction> {
  constructor() {
    super('LikeAction');
  }
}

class ActionBuilder extends SchemaBuilder<Action> {
  constructor() {
    super('Action');
  }
}

class SpeakableSpecificationBuilder extends SchemaBuilder<SpeakableSpecification> {
  constructor() {
    super('SpeakableSpecification');
  }
}

class CollectionPageBuilder extends SchemaBuilder<CollectionPage> {
  constructor() {
    super('CollectionPage');
  }
}

class AggregateOfferBuilder extends SchemaBuilder<AggregateOffer> {
  constructor() {
    super('AggregateOffer');
  }
}

class OfferBuilder extends SchemaBuilder<Offer> {
  constructor() {
    super('Offer');
  }
}

class ThingBuilder extends SchemaBuilder<Thing> {
  constructor() {
    super('Thing');
  }
}

class CategoryCodeBuilder extends SchemaBuilder<CategoryCode> {
  constructor() {
    super('CategoryCode');
  }
}

class CreativeWorkBuilder extends SchemaBuilder<CreativeWork> {
  constructor() {
    super('CreativeWork');
  }
}

class ArticleBuilder extends SchemaBuilder<Article> {
  constructor() {
    super('Article');
  }
}

class ItemListBuilder extends SchemaBuilder<ItemList> {
  constructor() {
    super('ItemList');
  }

  addItem(position: number, item: CreativeWork) {
    const elements = this.schema.itemListElement || [];
    return this.set({
      // @ts-ignore
      itemListElement: [...elements, { '@type': 'ListItem', position, item }],
    });
  }
}

class WebSiteBuilder extends SchemaBuilder<WebSite> {
  constructor() {
    super('WebSite');
  }
}

class ProfilePageBuilder extends SchemaBuilder<ProfilePage> {
  constructor() {
    super('ProfilePage');
  }
}

class ViewActionBuilder extends SchemaBuilder<ViewAction> {
  constructor() {
    super('ViewAction');
  }
}

export {
  ActionBuilder,
  AggregateOfferBuilder,
  AggregateRatingBuilder,
  ArticleBuilder,
  AudienceBuilder,
  BreadcrumbListBuilder,
  CategoryCodeBuilder,
  CollectionPageBuilder,
  ComicIssueBuilder,
  ComicSeriesBuilder,
  CommentActionBuilder,
  CommentBuilder,
  CreativeWorkBuilder,
  DiscussionForumPostingBuilder,
  EntryPointBuilder,
  ImageObjectBuilder,
  InteractionCounterBuilder,
  ItemListBuilder,
  LikeActionBuilder,
  ListItemBuilder,
  OfferBuilder,
  OrganizationBuilder,
  PersonBuilder,
  ProfilePageBuilder,
  SearchActionBuilder,
  SpeakableSpecificationBuilder,
  ThingBuilder,
  ViewActionBuilder,
  WebPageBuilder,
  WebPageElementBuilder,
  WebSiteBuilder,
};
