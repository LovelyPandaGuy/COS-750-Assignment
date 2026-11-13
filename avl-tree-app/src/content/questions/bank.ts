// Every item the app can ask: the C1 diagnostic and the module checks. The validator, mastery and the
// reducer's item lookup read this; `checksFor` stays checks only (add-diagnostic-c1-and-routing, decision 1).
import type { BankItem } from '../../assessment/types'
import { CHECKS } from './checks'
import { DIAGNOSTIC } from './diagnostic'
import { READINESS } from './readiness'

export const ALL_ITEMS: readonly BankItem[] = [...DIAGNOSTIC, ...CHECKS, ...READINESS]
