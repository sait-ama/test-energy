export interface ActivityItemState {
  isUpdating?: boolean;
  isDeleting?: boolean;
  isEditing?: boolean;
  isOptimisticAdded?: boolean;

  showReplies?: boolean | 'start' | 'end';
  showReplyForm?: boolean;
}
