// Local stylelint rule (add-ui-foundation, design decision 6): a font size in points is allowed only
// inside `@media print`. The token allow-list admits `pt` sizes; this rule confines them to print.
import stylelint from 'stylelint'

const ruleName = 'avl/print-points-only'
const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: (value) => `Point size "${value}" is allowed only inside @media print`,
})

const inPrint = (node) => {
  for (let p = node.parent; p; p = p.parent) {
    if (p.type === 'atrule' && p.name === 'media' && /\bprint\b/.test(p.params)) return true
  }
  return false
}

const rule = (enabled) => (root, result) => {
  if (!enabled) return
  root.walkDecls(/^font(-size)?$/, (decl) => {
    if (!/\d(?:\.\d+)?pt\b/.test(decl.value) || inPrint(decl)) return
    stylelint.utils.report({ ruleName, result, node: decl, message: messages.rejected(decl.value), word: decl.value })
  })
}
rule.ruleName = ruleName
rule.messages = messages

export default stylelint.createPlugin(ruleName, rule)
