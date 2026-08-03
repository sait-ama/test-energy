// Глобальный лоудинг позволяет нам показывать плейсхолдер
// пока мы подгружаем дату
// это нужно для решения проблемы с долгой навигацией
import { PostSkeletonWithoutTitle } from '~entities/post/ui/post-view-skeleton';

export default function RootLoading() {
  return <PostSkeletonWithoutTitle withImage className="h-3/5" />;
}
