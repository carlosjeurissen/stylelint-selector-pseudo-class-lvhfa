import stylelint from 'stylelint';
import without from 'lodash.without';
import difference from 'lodash.difference';
import selectorParser from 'postcss-selector-parser';

const ruleName = 'plugin/selector-pseudo-class-lvhfa';

const messages = stylelint.utils.ruleMessages(ruleName, {
	expected: 'Expected pseudo class selectors to follow LVHFA order.'
});

const correctOrder = [':link', ':visited', ':hover', ':focus', ':active'];

/**
 * @type {stylelint.RuleBase}
 */
function ruleFunction(/** @type boolean */ bool) {
	return (cssRoot, result) => {
		const validOptions = stylelint.utils.validateOptions(result, ruleName, {
			actual: bool
		});

		if (!validOptions) {
			return;
		}

		cssRoot.walkRules((rule) => {
			selectorParser((selector) => {
				/** @type {string[]} */
				let inputOrder = [];

				selector.walkPseudos((pseudo) => {
					if (correctOrder.indexOf(pseudo.value) !== -1) {
						inputOrder.push(pseudo.value);
					}
				});

				inputOrder = [...new Set(inputOrder)];
				const finalOrder = without(
					correctOrder,
					...difference(correctOrder, inputOrder)
				);
				const finalResult = finalOrder.every(
					(pseudo, index) => pseudo === inputOrder[index]
				);

				if (!finalResult) {
					stylelint.utils.report({
						ruleName: ruleName,
						result: result,
						node: rule,
						message: messages.expected
					});
				}
			}).processSync(rule.selector);
		});
	};
}

// @ts-ignore
const plugin = stylelint.createPlugin(ruleName, ruleFunction);

export default {
	...plugin,
	messages
};
