import {data} from '../data';
import {state} from '../state';
import * as jml from '../jml';

// export function delayedPromise(resolveFunc, fail?, ms?) {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       fail ? reject(resolveFunc()) : resolve(resolveFunc());
//     }, ms || 100);
//   });
// }

export function getMailboxes() {
  return data.mailboxes;
}

export function gotoMailbox(mailboxId) {
  jml.goto(mailboxId);
}

export function getSelectedMailbox() {
  let boxes = getMailboxes();
  return boxes ? boxes.find(m => m.id == state.mailbox.selectedId) : null;
}

export function getSelectedMessage() {
  if (!state.message.selectedId) {
    return null;
  }
  let box = getSelectedMailbox();
  return box.messages.find(b => b.id == state.message.selectedId);
}

export function isMailboxSelected(id) {
  return id == state.mailbox.selectedId;
}

export function isMessageSelected(id) {
  return id == state.message.selectedId;
}
