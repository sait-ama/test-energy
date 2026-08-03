import GroupOfPersons from '@re/ui-kit/icons/group-of-persons';
import User from '@re/ui-kit/icons/user';
import { Button } from '@re/ui-kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@re/ui-kit/ui/dropdown-menu';

import { LeftPanelView, useLeftPanelContext } from '../../../context';
import { ChatCreateIcon } from '../../ui/icons/chat';

function NewChannelButton() {
  const { setCurrentView } = useLeftPanelContext();

  const handleNewChatClick = () => {
    setCurrentView(LeftPanelView.NEW_CHAT);
  };

  const handleNewChannelClick = () => {
    setCurrentView(LeftPanelView.NEW_CHANNEL);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" circle>
          <ChatCreateIcon className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="rounded-2xl p-1 pt-0.5">
        <DropdownMenuItem className="rounded-xl" onClick={handleNewChatClick}>
          <User className="mr-2" /> <span>Новое сообщение</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="rounded-xl" onClick={handleNewChannelClick}>
          <GroupOfPersons className="mr-2" /> <span>Создать беседу</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
export { NewChannelButton };
