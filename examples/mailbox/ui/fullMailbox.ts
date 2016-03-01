import Folders, {Style as FoldersStyle} from './folders';
import Mailbox from './mailbox';
import Message from './message';
import Component from './component';

export interface Style {
  '#folders'?;
  $mailContainer?;
}

export default class extends Component<void, Style> {

  getDefaultStyle() {
    return {
      '#folders': {
        border: '1px solid #ccc'
      },
      $mailContainer: {
        'flex-direction': 'column',
        border: '1px solid #ccc'
      }
    };
  }

  getBody() {
    const {folders, mailbox, message} = this.logic;
    return [
      new Folders(folders.getMailboxes, folders, 'folders'),
      {div$mailContainer: [
        new Mailbox(mailbox.getSelectedMailbox, mailbox, 'mailbox'),
        new Message(message.getSelectedMessage, message, 'message')
      ]}
    ];
  }

}
