import { useContext } from 'react';

import { SearchContext } from '../context/search-provider';

export function useQuery() {
  return useContext(SearchContext);
}
