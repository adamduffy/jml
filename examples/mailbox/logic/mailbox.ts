export {isMessageSelected, getMailboxes, getSelectedMailbox} from './main';
import * as jml from '../jml';

export function gotoMessage(mailboxId, messageId) {
  jml.goto(mailboxId + '/' + messageId);
}
