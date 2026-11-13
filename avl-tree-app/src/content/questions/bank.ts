// The C1 diagnostic and the module checks (C9's readiness bank is separate, D84). The validator, mastery and the
// reducer's item lookup read this; `checksFor` stays checks only (add-diagnostic-c1-and-routing, decision 1).
import type { BankItem } from '../../assessment/types'
import { CHECKS } from './checks'
import { DIAGNOSTIC } from './diagnostic'

export const ALL_ITEMS: readonly BankItem[] = [...DIAGNOSTIC, ...CHECKS]
