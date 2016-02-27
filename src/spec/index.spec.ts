import {expect, use} from 'chai';
import * as jml from '../jml.ts';

function expectBody(html: string) {
  expect(document.body.innerHTML).to.equal(html);
}

describe('jml', () => {

  it('renders a span', () => {
    const result = jml.render({span: 'this is a span'});
    expect(result).to.equal('<span>this is a span</span>');
  });

  it('turns _id into a discoverable id', () => {
    const result = jml.renderPage({span: [{_id: 'mySpanId'}, 'welcome to jml']});
    const elem = document.getElementById('mySpanId');
    expect(elem).to.not.be.null;
  });

  it('renders child elements', () => {
    const x = {div: [
      {span: 'span 1'},
      {span: 'span 2'}
    ]};
    const result = jml.render(x);
    expect(result).to.equal('<div><span>span 1</span><span>span 2</span></div>');
  });

  it('adds and dedupes class names in many ways', () => {
    const x = {
      span$myClass1$myClass3: [
        {_id: 'testId'},
        'a very classy span',
        {_class: 'myClass1 myClass2'},
        {_class: 'myClass3'}
    ]};
    const result = jml.renderPage(x);
    const elem = document.getElementById('testId');
    expect(elem.className).to.equal('myClass1 myClass2 myClass3');
  });

  it('renders component.getBody()', () => {
    const myComponent = {
      getBody() {
        return {span: 'this is a component'};
      }
    };
    jml.renderPage(myComponent);
    expectBody('<component id="0"><span>this is a component</span></component>');
  });

  it('renders component.getBody() as Promise', () => {
    const testPromise = Promise.resolve({span: 'this is a resolved promise'});
    const myComponent = {
      getBody() {
        return testPromise;
      },
      getLoadingBody() {
        return {span: 'loading'};
      }
    };
    jml.renderPage(myComponent);
    expectBody('<component id="0"><span>loading</span></component>');
    return testPromise.then(() => {
      expectBody('<component id="0"><span>this is a resolved promise</span></component>');
    });
  });

  it('wires and invokes the click event', () => {
    let clicked = false;
    const x = {span: [
      {_id: 'testId'},
      {$click: () => clicked = true},
      'click here!'
    ]};
    jml.renderPage(x);
    const span = document.getElementById('testId');
    span.click();
    expect(clicked).to.equal(true);
  });

});
