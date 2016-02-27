import FullMailbox from '../ui/fullMailbox.ts';
import Component from '../ui/component';
import {CssVar} from '../ui/cssvar';

export interface Style {
  $clickable;
}

export default class extends Component<any, Style> {

  getDefaultStyle(): any {
    return {
      $clickable: {
        cursor: 'pointer',
        ':hover': {
          'text-decoration': 'underline',
          'background-color': CssVar.red
        }
      }
    };
  }

  getBody() {
  	// could dress this up with header/footer.
    return new FullMailbox(this.dataSource, this.logic, "main");
  }

}
