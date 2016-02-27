import * as jml from './jml.ts';

window.onload = bodyOnLoad;

function bodyOnLoad() {
  document.body.innerHTML = jml.render(myComponent);
}

const myComponent = {
  getBody() {
    return {span: 'my first JML app'};
  }
};
