import {tableRowTd, tableRowTh} from './common';
import Component from './component';
import {Mailbox} from '../data';
import {click} from './events';
import {classIf} from './props';

export interface Style {
  $selected?;
  $mailboxClass?;
  tr?;
}

export default class extends Component<Mailbox, Style> {

  getDefaultStyle(): Style {
    return {
      $selected: {color: 'green'},
      $mailboxClass: {'background-color': 'lightblue'},
      tr: {
        'background-color': 'pink',
        '.clickable:hover': {
          'color': 'white'
        }
      }
    };
  }

  getMessageRows(box: Mailbox): any {
    const {logic} = this;
    return Array.from(box.messages, (m: any) => {
      let row = tableRowTd(
        m.date.toLocaleDateString(),
        m.subject, m.from, m.to);
      row.tr.push({_class: 'clickable'});
      row.tr.push(click(() => logic.gotoMessage(box.id, m.id)));
      row.tr.push(classIf(logic.isMessageSelected(m.id), 'selected'));
      return row;
    });
  }

  getBody(): any {
    let box = this.dataSource();
    if (!box) {
      return {span: 'select a mailbox'};
    }
    return {table$mailboxClass: [
      tableRowTh('date', 'subject', 'from', 'to'),
      this.getMessageRows(box)
    ]};
  }

}
