import Component from './component';
import {Folders, Mailbox} from '../data';
import {classIf} from './props';
import {click} from './events';

export interface Style {
  $foldersClass?;
  $count?;
  $selected?;
};

export default class extends Component<Mailbox[], Style> {

  getDefaultStyle(): Style {
    return {
      $foldersClass: {
        color: 'blue',
        width: '180px'
      },
      $count: {
        float: 'right'
      },
      $selected: {
        'background-color': 'lightgray'
      }
    };
  }

  getBody() {
    const boxes = this.dataSource();
    return {div$foldersClass:
      {ul: [
        {li: {h2$clickable: [click(this.logic.gotoMailbox), 'Mailboxes']}},
        Array.from(boxes, (m: Mailbox) => this.getMenuItem(m))
      ]}
    };
  }

  getMenuItem(box: Mailbox) {
    return {li$clickable: [
      classIf(this.logic.isMailboxSelected(box.id), 'selected'),
      click(() => this.logic.gotoMailbox(box.id)),
      {span$count: box.messages.length},
      box.name
    ]};
  };

}
