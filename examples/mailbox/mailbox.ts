import * as jml from './jml';
import {Logic} from './logic';
import {state} from './state';
import {data} from './data';
import MailboxPage from './pages';
const w = window as any;
w.onload = windowOnLoad();

function windowOnLoad() {
  w.jml = jml;
  w.onhashchange = hashChanged;
  hashChanged();
}

function hashChanged() {
  const start = performance.now();
  let hash = window.location.hash;
  hash = hash ? hash.substring(1) : '';
  const body = getPage(hash);
  jml.reset();
  window.document.body.innerHTML = jml.render(body);
  jml.applyStyles('jml-style');
  jml.applyEvents();
  const end = performance.now();
  console.log('page refresh in ' + (end - start) + 'ms');
}

function getPage(hash: string) {
  const parts = hash.split('/');
  state.mailbox.selectedId = parts[0];
  state.message.selectedId = parseInt(parts[1], 0);
  return new MailboxPage(() => data, Logic, "page");
}
