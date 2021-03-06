'use strict'

/**
 * @fileoverview Disallows or enforces spaces inside computed properties.
 * @author Jamund Ferguson
 * @copyright 2015 Jamund Ferguson. All rights reserved.
 */
// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'layout',
    docs: {
      url: 'https://github.com/standard/eslint-plugin-standard#rules-explanations'
    }
  },

  create: function (context) {
    const propertyNameMustBeSpaced = context.options[0] === 'always' // default is "never"
    const propertyNameMustBeEven = context.options[0] === 'even' // default is "never"

    // --------------------------------------------------------------------------
    // Helpers
    // --------------------------------------------------------------------------

    /**
     * Determines whether two adjacent tokens are have whitespace between them.
     * @param {Object} left - The left token object.
     * @param {Object} right - The right token object.
     * @returns {boolean} Whether or not there is space between the tokens.
     */
    function isSpaced (left, right) {
      return left.range[1] < right.range[0]
    }

    /**
     * Determines whether two adjacent tokens are on the same line.
     * @param {Object} left - The left token object.
     * @param {Object} right - The right token object.
     * @returns {boolean} Whether or not the tokens are on the same line.
     */
    function isSameLine (left, right) {
      return left.loc.start.line === right.loc.start.line
    }

    /**
     * Reports that there shouldn't be a space after the first token
     * @param {ASTNode} node - The node to report in the event of an error.
     * @param {Token} token - The token to use for the report.
     * @returns {void}
     */
    function reportNoBeginningSpace (node, token) {
      context.report(node, token.loc.start,
        "There should be no space after '" + token.value + "'")
    }

    /**
     * Reports that there shouldn't be a space before the last token
     * @param {ASTNode} node - The node to report in the event of an error.
     * @param {Token} token - The token to use for the report.
     * @returns {void}
     */
    function reportNoEndingSpace (node, token) {
      context.report(node, token.loc.start,
        "There should be no space before '" + token.value + "'")
    }

    /**
     * Reports that there should be a space after the first token
     * @param {ASTNode} node - The node to report in the event of an error.
     * @param {Token} token - The token to use for the report.
     * @returns {void}
     */
    function reportRequiredBeginningSpace (node, token) {
      context.report(node, token.loc.start,
        "A space is required after '" + token.value + "'")
    }

    /**
     * Reports that there should be a space before the last token
     * @param {ASTNode} node - The node to report in the event of an error.
     * @param {Token} token - The token to use for the report.
     * @returns {void}
     */
    function reportRequiredEndingSpace (node, token) {
      context.report(node, token.loc.start,
        "A space is required before '" + token.value + "'")
    }

    /**
     * Returns a function that checks the spacing of a node on the property name
     * that was passed in.
     * @param {String} propertyName The property on the node to check for spacing
     * @returns {Function} A function that will check spacing on a node
     */
    function checkSpacing (propertyName) {
      return function (node) {
        if (!node.computed) {
          return
        }

        const property = node[propertyName]

        const before = context.getTokenBefore(property)
        const first = context.getFirstToken(property)
        const last = context.getLastToken(property)
        const after = context.getTokenAfter(property)
        let startSpace, endSpace

        if (propertyNameMustBeEven) {
          if (!isSameLine(before, after)) {
            context.report(node, 'Expected "[" and "]" to be on the same line')
            return
          }
          startSpace = first.loc.start.column - before.loc.end.column
          endSpace = after.loc.start.column - last.loc.end.column

          if (startSpace !== endSpace || startSpace > 1) {
            context.report(node, 'Expected 1 or 0 spaces around "[" and "]"')
          }

          return
        }

        if (isSameLine(before, first)) {
          if (propertyNameMustBeSpaced) {
            if (!isSpaced(before, first) && isSameLine(before, first)) {
              reportRequiredBeginningSpace(node, before)
            }
          } else {
            if (isSpaced(before, first)) {
              reportNoBeginningSpace(node, before)
            }
          }
        }

        if (isSameLine(last, after)) {
          if (propertyNameMustBeSpaced) {
            if (!isSpaced(last, after) && isSameLine(last, after)) {
              reportRequiredEndingSpace(node, after)
            }
          } else {
            if (isSpaced(last, after)) {
              reportNoEndingSpace(node, after)
            }
          }
        }
      }
    }

    // --------------------------------------------------------------------------
    // Public
    // --------------------------------------------------------------------------

    return {
      Property: checkSpacing('key'),
      MemberExpression: checkSpacing('property')
    }
  }
}
