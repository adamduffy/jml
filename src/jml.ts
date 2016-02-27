interface Component {
  id?: string;
  getBody(): any;
  getStyle(): any;
  getLoadingBody?(): any;
  jmlid?: string;
  dirty?: boolean;
  html?: string;
  // watch?: any;
  // nofityWatchers?(): void;
}

export const functions: Array<Function> = [];
const eventMap: Array<any> = [];
const components: Array<Component> = [];

export function reset(): void {
  eventMap.length = 0;
  functions.length = 0;
  components.length = 0;
}

export function goto(hash: string): void {
  window.location.hash = hash || '';
}

export function renderPage(o: any): void {
  reset();
  document.body.innerHTML = render(o);
  applyStyles();
  applyEvents();
}

export function render(o: any): string {
  if (o === undefined) {
    return '[undefined]';
  } else if (o instanceof String || typeof o === 'string') {
    return o;
  } else if (o instanceof Number || typeof o === 'number') {
    return o.toString();
  } else if (o instanceof Array) {
    return renderArray(o);
  } else if (o.getBody instanceof Function) {
    return renderComponent(o as Component);
  } else {
    return renderObject(o);
  }
}

export function applyEvents(startIndex: number = 0) {
  const w = window as any;
  for (let i = startIndex; i < eventMap.length; i++) {
    const elem = w.document.querySelector('[data-jmlevent="' + i + '"]');
    if (!elem) {
      continue;
    }
    for (let event in eventMap[i]) {
      elem.addEventListener(event, eventMap[i][event]);
    };
  };
}

export function mergeStyles(dest: any, source: any): void {
  for (let k in source) {
    dest[k] = dest[k] || {};
    for (let v in source[k]) {
      if (source[k][v] instanceof Object) {
        dest[k][v] = dest[k][v] || {};
        for (let v2 in source[k][v]) {
          dest[k][v][v2] = source[k][v][v2];
        }
      } else {
        dest[k][v] = source[k][v];
      }
    }
  }
}

export function applyStyles() {
  const styles = {};
  components.forEach(c => {
    if (c.getStyle instanceof Function) {
      const style = c.getStyle();
      styles[c.id] = styles[c.id] || {};
      mergeStyles(styles[c.id], style);
    }
  });
  const sheet = styleToStyleSheet(styles);
  const styleElement: any =
    document.head.getElementsByTagName('style')[0] ||
    document.head.appendChild(document.createElement('style'));
  if (styleElement.innerHTML !== sheet) {
    styleElement.innerHTML = '';
    styleElement.innerHTML = sheet;
  }
}

function styleToStyleSheet(styles: any) {
  let css = '';
  for (let id in styles) {
    const ids = styles[id];
    let repeatWithState = false;
    for (let sel in ids) {
      const values = ids[sel];
      sel = sel.replace('$', '.');
      css += `#${id} ${sel} {\n`;
      for (let style in values) {
        if (values[style] instanceof Object) {
          repeatWithState = true;
        } else {
          css += '\t' + style + ':' + values[style] + ';\n';
        }
      }
      css += '}\n';
    }
    if (repeatWithState) {
      for (let sel in ids) {
        const values = ids[sel];
        for (let styleAsState in values) {
          if (values[styleAsState] instanceof Object) {
            const states = values[styleAsState];
            sel = sel.replace('$', '.');
            sel = sel + styleAsState;
            css += `#${id} ${sel} {\n`;
            for (let stateKeys in states) {
              css += '\t' + stateKeys + ':' + states[stateKeys] + ';\n';
            }
            css += '}\n';
          }
        }
      }
    }
  }
  return css;
}

export function rerender(c: Component, body?: any): number {
  let changes = 0;
  const eventStartIndex = eventMap.length;
  renderComponent(c, body);
  if (c.dirty) {
    let element = document.getElementById(c.id);
    if (element) {
      changes++;
      element.outerHTML = c.html;
      applyStyles();
      applyEvents(eventStartIndex);
    } else {
      let pos = components.indexOf(c);
      if (pos > -1) {
        components.splice(pos, 1);
      }
    }
  }
  return changes;
}

function renderArray(a: Array<any>): string {
  let html = '';
  a.forEach(o => html += render(o));
  return html;
}

function renderComponent(c: Component, body?: any): string {
  if (c.jmlid === undefined) {
    c.jmlid = (components.push(c) - 1).toString();
    if (c.id === undefined) {
      c.id = c.jmlid;
    }
  }
  if (body === undefined) {
    body = c.getBody();
  }
  if (body instanceof Promise) {
    body.then(
      (newBody: any) => rerender(c, newBody),
      (error: any) => rerender(c, error)
    );
    body = c.getLoadingBody();
  }
  let html = '<component id="' + c.id + '">';
  html += render(body);
  html += '</component>';
  c.dirty = (c.html === undefined) ? false : c.html !== html;
  c.html = html;
  // if (c.watch) {
  //   addWatcher(c.watch, c);
  // }
  return html;
}

// todo: is watchers a useful thing?
// function addWatcher(obj: any, c: any): void {
//   if (!obj.watchers) {
//     obj.watchers = [];
//   }
//   if (!obj.watchers.find((w: any) => w === c)) {
//     obj.watchers.push(c);
//   }
//   if (!obj.notifyWatchers) {
//     obj.notifyWatchers = function() {
//       for (let w in obj.watchers) {
//         let notifyComponent = obj.watchers[w] as Component;
//         if (!document.getElementById(notifyComponent.id)) {
//           delete obj.watchers[w];
//         } else {
//           rerender(notifyComponent);
//         }
//       }
//     };
//   }
// }

function renderObject(o: any): string {
  let html = '';
  for (let p in o) {
    if (isAttribute(p) || isEvent(p)) {
      continue; // attribute and events should already be applied
    }
    let classProp: Array<string>, name: string, pos: number;
    if ((pos = p.indexOf('$')) > 0) {
      name = p.substring(0, pos);
      classProp = p.substring(pos + 1).split('$');
    } else {
      name = p;
      classProp = [];
    }
    let children = hasChildren(o[p]);
    html += renderElementOpen(name, o[p], classProp, !children);
    if (children) {
      html += render(o[p]);
      html += '</' + name + '>';
    }
  }
  return html;
}

function renderElementOpen(name: string, o: any, classProp: Array<string>, close: boolean): string {
  return '<' + name +
    renderProps(o, classProp) + (
    close ? ' />' : '>');
}

function renderProps(o: any, classProp: Array<string>): string {
  let props = '';
  const events = {};
  if (o instanceof Array) {
    o.forEach((p: any) => props += renderPropsFromObject(p, classProp, events));
  } else {
    props = renderPropsFromObject(o, classProp, events);
  }
  if (usableClassProp(classProp)) {
    props = ' class="' + classProp.join(' ') + '"' + props;
  }
  if (hasContent(events)) {
    const id = eventMap.push(events) - 1;
    props = ' data-jmlevent="' + id + '"' + props;
  }
  return props;
}

function hasContent(o: any) {
  for (let p in o) {
    if (o.hasOwnProperty(p)) {
        return true;
    }
  }
  return false;
}

function renderPropsFromObject(o: any, classProp: Array<string>, events: any): string {
  let props = '';
  for (let p in o) {
    if (isAttribute(p)) {
      props += ' ';
      let val = o[p];
      p = p.substring(1);
      if (val instanceof Array && val[0] instanceof Function) {
        let f = addFunction(val[0]);
        let nameHelp = val[0].name ? '/*' + val[0].name + '*/' : '';
        val.shift();
        let argString = val.join(',');
        props += `${p}="jml.functions[${f}]${nameHelp}(${argString})"`;
      } else if (val instanceof Function) {
        let f = addFunction(val);
        let nameHelp = val.name ? '/*' + val.name + '*/' : '';
        props += `${p}="jml.functions[${f}]${nameHelp}()"`;
      } else if (p === 'class') {
        if (val instanceof Array) {
          [].push.apply(classProp, val);
        } else if (val.indexOf(' ') > -1) {
          [].push.apply(classProp, val.split(' '));
        } else if (val) {
          classProp.push(val);
        }
      } else {
        props += p + '="' + (val ? val : '') + '"';
      }
    } else if (isEvent(p)) {
      events[p.substring(1)] = o[p];
    }
  }
  return props;
}

function usableClassProp(classProp: Array<string>): boolean {
  if (classProp.length === 0) {
    return false;
  }
  for (let i = 0; i < classProp.length; i++) {
    if (!classProp[i] || (classProp.indexOf(classProp[i], i + 1) > -1)) {
      classProp.splice(i, 1);
      i--;
    }
  }
  return classProp.length > 0;
}

function addFunction(f: Function): number {
  let i = functions.indexOf(f);
  if (i > -1) {
    return i;
  }
  return functions.push(f) - 1;
}

function isAttribute(o: string): boolean {
  return o.indexOf('_') === 0;
}

function isEvent(o: string): boolean {
  return o.indexOf('$') === 0;
}

function hasChildren(o: any): boolean {
  if (
    o instanceof Array ||
    (typeof o === 'string' || o instanceof String) ||
    (o instanceof Number || typeof o === 'number')
  ) {
      return true;
  }
  for (let k in o) {
    if (!isAttribute(k)) {
      return true;
    }
  }
  return false;
}
