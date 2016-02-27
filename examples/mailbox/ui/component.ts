import {mergeStyles} from '../jml';

export default class<T, S> {

  dataSource: () => T;
  logic: any;
  id: string;
  style: any;

  constructor(dataSource?: () => T, logic?: any, id?: string, style?: S) {
    this.id = id;
    this.dataSource = dataSource;
    this.logic = logic;
    this.style = this.getDefaultStyle();
    if (style) {
      mergeStyles(this.style, style);
    }
  }
  getDefaultStyle(): S {
    return {} as S;
  }
  getStyle(): S {
    return this.style;
  }

}
