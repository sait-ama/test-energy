//todo unused?
// import Link from 'next/link';
//
// import Activity from '@re/ui-kit/icons/activity';
// import { cn } from '@re/ui-kit/src/utils/cn';
// import { Button } from '@re/ui-kit/ui/button';
// import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@re/ui-kit/ui/dialog';
// import { ReText } from '@re/ui-kit/ui/text';
//
// import { HeroCard, HeroCardSkeleton } from '~entities/inventory/ui/hero-card';
// import { getDeckById } from '~entities/shop/model/queries';
// import { DeckCard, DeckCardProps, DeckImage } from '~entities/shop/ui/deck';
// import { DeckSchema, DeckType, ShortCardItemSchema } from '~shared/api/models/shop';
// import { Routing } from '~shared/config/routing';
// import { useHeroCardModal } from '~shared/lib/card/use-card-modal';
// import { ContentSuspenseQuery } from '~shared/lib/react-query/content-suspense-query';
// import { QuerySuspenseContainer } from '~shared/lib/react-query/query-suspense-container';
// import type { FlatListType } from '~shared/ui/flat-list-v2';
// import { FlatList as _FlatList } from '~shared/ui/flat-list-v2';
// import * as ItemCard from '~shared/ui/item-card';
//
// interface DecksCardsFallbackProps {
//   count: number;
// }
//
// export const DecksCardsFallback = (props: DecksCardsFallbackProps) => {
//   const { count } = props;
//   const FlatList: FlatListType<DeckSchema[]> = _FlatList;
//
//   return (
//     <div className="w-full">
//       <FlatList.Layout
//         layout="grid"
//         className="grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4"
//       >
//         <FlatList.Loading count={count}>
//           {({ key }) => <HeroCardSkeleton key={key} />}
//         </FlatList.Loading>
//       </FlatList.Layout>
//     </div>
//   );
// };
//
// interface DeckCardsProps<T extends DeckSchema> {
//   model: T | null;
// }
//
// export const DeckCards = <T extends DeckSchema>(props: DeckCardsProps<T>) => {
//   const { model } = props;
//   const { setCard } = useHeroCardModal();
//
//   if (!model) return null;
//
//   const FlatList: FlatListType<ShortCardItemSchema[]> = _FlatList;
//   const cards = model?.cards ?? [];
//
//   const isRandomDeck = model?.type === DeckType.RANDOM;
//
//   return (
//     <FlatList.Root content={cards} className="w-full">
//       <FlatList.Layout
//         layout="grid"
//         className="grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4"
//       >
//         <FlatList.Content>
//           {({ item, attributes }) => (
//             <HeroCard
//               key={item.id}
//               card={item}
//               faceDown={isRandomDeck}
//               {...attributes}
//               className="min-w-[120px]"
//               onClick={() => {
//                 !isRandomDeck && setCard(item);
//               }}
//             />
//           )}
//         </FlatList.Content>
//         <FlatList.Empty className="col-span-full" />
//       </FlatList.Layout>
//     </FlatList.Root>
//   );
// };
//
// interface DeckPreviewProps<T> extends Omit<DeckCardProps<DeckSchema>, 'model'> {
//   model: T | null;
// }
//
// export const DeckCardWithPreviewModal = <T extends any>(props: DeckPreviewProps<T>) => {
//   const { model, ...rest } = props;
//
//   return (
//     <Dialog>
//       <DialogTrigger>
//         <DeckCard model={{ ...model?.deck, cost: model?.cost }} withPrice {...rest} />
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-fit">
//         <DialogTitle className="sr-only">{model?.deck?.name}</DialogTitle>
//         <div className="-mb-[170px] flex w-full -translate-y-[130px] items-center justify-center">
//           <DeckImage
//             size={220}
//             src={model?.deck?.cover?.high}
//             alt={model?.deck?.name ?? ''}
//             className={cn({ grayscale: !model?.cost })}
//           />
//         </div>
//
//         <div className="flex flex-col items-center gap-2 p-0">
//           <ItemCard.Label size="xs" weight="medium" color="muted-foreground">
//             {model?.deck?.name}
//           </ItemCard.Label>
//         </div>
//         <div className="m-auto p-0">
//           <Link
//             prefetch={false}
//             shallow={false}
//             href={Routing.Deck.open({ params: { id: model?.deck?.id } })}
//           >
//             <Button>
//               Купить/Открыть
//               <span className="ml-2 flex items-center gap-1">
//                 <Activity className="size-4" />
//                 {model?.cost}
//               </span>
//             </Button>
//           </Link>
//         </div>
//
//         <div className="flex w-full max-w-xl flex-col items-center gap-2">
//           <ReText size="sm">Состав пака</ReText>
//           <QuerySuspenseContainer
//             fallback={<DecksCardsFallback count={model?.deck?.count_cards ?? 10} />}
//           >
//             <ContentSuspenseQuery
//               queryOptions={getDeckById({
//                 variables: { params: { deckId: model?.deck?.id! } },
//               })}
//             >
//               {({ data }) => <DeckCards model={data} />}
//             </ContentSuspenseQuery>
//           </QuerySuspenseContainer>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };
