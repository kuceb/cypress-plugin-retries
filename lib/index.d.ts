/// <reference types="cypress" />

	declare namespace Cypress {
			interface Cypress {
					/**
					 * Gets the current test. Added by cypress-plugin-retries
					 */
					currentTest: Mocha.Test
			}
	}
