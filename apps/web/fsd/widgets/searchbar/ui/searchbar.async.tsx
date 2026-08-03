import { lazy, Suspense } from 'react';

const Searchbar = lazy(() =>
  import(/* webpackChunkName: "Searchbar" */ '~widgets/searchbar/ui/searchbar').then((m) => ({
    default: m.Searchbar,
  }))
);

export const SearchModalAsyncConditional = () => {
  //   const { isOpen, close } = useSearchModal();

  // if (!isOpen) return null;

  return (
    <Suspense fallback={null}>
      <Searchbar />
    </Suspense>
  );
};
