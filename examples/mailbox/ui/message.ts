import Component from './component';
import {Message} from '../data';

export interface Style {
  $messageClass?;
  $messageHeader?;
}

export default class extends Component<Message, Style> {

  getDefaultStyle(): Style {
    return {
      $messageClass: {
        color: 'green',
        'flex-direction': 'column'
      },
      $messageHeader: {
        tr: {
          'text-align': 'left'
        }
      }
    };
  }

  getBody(): any {
    const message = this.dataSource();
    if (!message) {
      return {};
    }
    return {div$messageClass: [
      {table$messageHeader: [
        {tr: [{th: 'from'}, {td: message.from}]},
        {tr: [{th: 'to'}, {td: message.to}]},
        {tr: [{th: 'date'}, {td: message.date.toLocaleDateString()}]}
      ]},
      {h4: message.subject},
      {p: message.body}
    ]};
  }

}
