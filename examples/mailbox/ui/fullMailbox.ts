import Folders, {Style as FoldersStyle} from './folders';
import Mailbox from './mailbox';
import Message from './message';
import Component from './component';

export default class extends Component<void, void> {

  getBody() {
    const {folders, mailbox, message} = this.logic;
    return [
      new Folders(folders.getMailboxes, folders, 'folders'),
      new Mailbox(mailbox.getSelectedMailbox, mailbox, 'mailbox'),
      new Message(message.getSelectedMessage, message, 'message')
    ];
  }

}
