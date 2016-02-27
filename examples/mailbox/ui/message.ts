import Component from './component';
import {Message} from '../data';

export interface Style {
  $messageClass?;
}

export default class extends Component<Message, Style> {

  getDefaultStyle(): Style {
    return {
      $messageClass: {color: 'green'}
    };
  }

  getBody(): any {
    const message = this.dataSource();
    if (!message) {
      return {};
    }
    return {div$messageClass: [
      {dl: [
        {dt: 'from'}, {dd: message.from},
        {dt: 'to'}, {dd: message.to},
        {dt: 'date'}, {dd: message.date.toLocaleDateString()}
      ]},
      {h4: message.subject},
      {p: message.body}
    ]};
  }

}
