JML
===

JML renders javascript objects into html.  This technique allows for dynamic content to be rendered on the fly without ever touching html.

## Simple examples

results when jml.render() is called on the object.

```javascript
{span: 'hello world!'};
```
```html
<span>hello world!</span>
```

### child elements

```javascript
{div: [
	{span: 'span 1'},
	{span: 'span 2'}
]}
```
```html
<div><span>span 1</span><span>span 2</span></div>
```

### properties

prefix any key with underscore to specify a property of the owner.

```javascript
{span: [{_id: 'mySpanId'}, 'welcome to jml']}
```

```html
<span id="mySpanId">welcome to jml</span>
```

### variables

since this is javascript to begin with, variables work naturally

```javascript
var data = {name: 'adam'};
{span: 'my name is ' + data.name}
```
```html
<span>my name is adam</span>
```

### functions

JML will automatically map your functions to the html output.
(note: DOM events are the preferred technique. described later)

```javascript
function myFunction() {
	alert('hi');
}
{span: [{_onclick: myFunction}, 'click here']}
```
```html
<span onclick="jml.functions[0]()">click here</span>
```

function with parameters (note the quote around the parameters)

```javascript
function myFunction(message) {
	alert(message);
}
{span: [{_onclick: [myFunction, "'hi'"]}, 'click here']}
```
```html
<span onclick="jml.functions[0]('hi')">click here</span>
```

### class handling

classes are just properties:
```javascript
{span: [{_class: 'myClass'}, 'a classy span']}
```
```html
<span class='myClass'>a classy span</span>
```
since class is so common, jml has a shorthand by using $ on the element name:
```javascript
{span$myClass: 'a classy span'}
```
```html
<span class='myClass'>a classy span</span>
```
and allows for combinations of techniques and de-duping of class names.  properties can also be anywhere in the set of children (this is helpful for appending dynamically)

```javscript
{span$myClass1$myClass3: ['a very classy span', {_class: 'myClass1 myClass2'}, {_class: 'myClass3'}]}
```
```html
<span class='myClass1 myClass2 myClass3'>a very classy span</span>
```

###components
jml will render modular ui elements as components that allow for special interaction such as independent re-rendering and promise resolution.  to do this, expose a getBody() method.

```javascript
var myComponent = {
	getBody() {
		return {span: 'this is a component'};
	}
}
```
```html
<component id="0"><span>this is a component</span></component>
```

you can give the component your own id or jml will auto-assign one so it can reference it for re-rendering, etc.  

if your code maintains a reference to this object, the ui can be refreshed later by calling jml.rerender(c).  this technique is best for low-level components where you want immediate response.  For most cases, just re-rendering the whole page is much easier to manage. (and should still be very snappy)

###Asynchronous component loading

to make loading, ready, and failure states, simply return a promise from getBody and expose a getLoadingBody() method.  jml will re-render the ui when the promise is resolved or fails.  

```javascript
var myComponent = {
	getBody() {
		return Promise.resolve({span: 'this is a resolved promise'});
	},
	getLoadingBody() {
		return {span: 'loading'};
	}
}
```
'loading' will render until the promise is resolved.
```html
<component id="0"><span>this is a resolved promise</span></component>
```

###Reading input data

To keep the abstraction away from html, the best way to read user input is by mapping it back to your javascript data objects.  You can do this with the change or other similar element events.  JML will wire up native dom element events if you begin a property with $. Another option is to give the element a unique id and find it later.  

Both techniques are demonstrated here:

```javascript
function myInputForm(data) {
  const c = {
    lastNameId: Math.random(),
    setFirstName(value) {
      data.firstName = value;
    },
    submit() {
      data.lastName = document.getElementById(c.lastNameId).value;
      alert(data.firstName + " " + data.lastName);
    },
    getBody() {
      return [
        {input: {_type: "text", _value: data.firstName, $change: (e) => c.setFirstName(e.srcElement.value)}},
        {input: {_type: "text", _value: data.lastName, _id: c.lastNameId}},
        {button: [{$click: c.submit}, 'submit']}
      ];
    }
  };
  return c;
}
```
```html
<component id="0"><input data-jmlevent="0" type="text" value=""><input type="text" value="" id="0.6726410109549761"><button data-jmlevent="1">submit</button></component>
```

##Styles

JML also uses javascript to define CSS.  The general format is as follows:
```javascript
{
	id: {
		class: {
			property: value,
			state: {
				property: value, ...
			}, ...
		}, ...
	}, ...
}
```
JML uses c.id and c.getStyle() to maintain the composite css object. Class names can still be prepended with $ in place of . when desired (other selectors work in place of class name).  Included examples show techniques to define and override default styles.
```javascript
var myComponent = {
	id: 'page',
	getStyle() {
    return {
      $clickable: {
        cursor: 'pointer',
        ':hover': {
					'text-decoration': 'underline'
        }
      }
    };
  }
}
```
```css
#page .clickable {
	cursor:pointer;
}
#page .clickable:hover {
	text-decoration:underline;
}
```

##Putting it all together

That is the extent of the JML library itself.  This leaves a lot of room for project architecture around it.  Here is a basic example of how to begin:

start with a simple html file:
```html
<!DOCTYPE html>
<html>
<head>
	<script type="text/javascript" src="readme.js"></script>
	<title>JML example</title>
</head>
	<body>
	</body>
</html>
```

and a simple js file:
```javascript
import * as jml from './jml';

window.onload = bodyOnLoad();

function bodyOnLoad() {
	document.body.innerHTML = jml.render(myComponent);
}

var myComponent = {
	getBody() {
		return {span: 'my first JML app'});
	}
}
```

The included example shows a technique of structuring an application with ui, data, logic, and state all managed.
