import FullMailbox from '../ui/fullMailbox.ts';
import Component from '../ui/component';
import {CssVar} from '../ui/cssvar';

export interface Style {
  $clickable?;
  '#main'?;
  '#main div'?;
}

export default class extends Component<any, Style> {

  getDefaultStyle(): any {
    return {
      $clickable: {
        cursor: 'pointer',
        ':hover': {
          'text-decoration': 'underline'
        }
      },
      '#main': {
        display: 'flex',
        width: '100%',
        padding: '17px'
      },
      '#main div': {
        display: 'flex'
      }
    };
  }

  getBody() {
  	// could dress this up with header/footer.
    return new FullMailbox(this.dataSource, this.logic, "main");
  }

}
