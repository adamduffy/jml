export function event(name, func) {
  const o = {};
  o['$' + name] = func;
  return o;
}

export function click(func) {
  return {$click: func};
}
