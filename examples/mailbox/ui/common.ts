export function tableRowTd(...args): any {
  return {tr: Array.from(args, a => {return {td: a}})};
}
export function tableRowTh(...args): any {
  return {tr: Array.from(args, a => {return {th: a}})};
}
