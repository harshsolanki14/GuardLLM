// ============================================================================
// SECURITY TEST TYPES
// ============================================================================

export type TestId =
  | 'LLM01'
  | 'LLM02'
  | 'LLM03'
  | 'LLM04'
  | 'LLM05'
  | 'LLM06'
  | 'LLM07'
  | 'LLM08'
  | 'LLM09'
  | 'LLM10'
  | 'ATT01'
  | 'ATT02'
  | 'ATT03'
  | 'ATT04'
  | 'ATT05'
  | 'ATT06'
  | 'ATT07'
  | 'ATT08'
  | 'ATT09'
  | 'ATT10';

export interface Test {
  id: TestId;
  title: string;
  description: string;
  attackExplanation: string;
  isTestable: boolean;
}

// ============================================================================
// TEST RESULT TYPES
// ============================================================================

export type TestStatus = 'pass' | 'fail' | 'warning' | 'error' | 'running' | 'pending' | 'not-testable';

export const VALID_TEST_STATUSES = ['pass', 'fail', 'warning', 'error', 'running', 'pending', 'not-testable'] as const;

export interface TestResult {
  id: TestId;
  title: string;
  status: TestStatus;
  attackPrompt: string;
  response: string;
  analysis: string;
}

// ============================================================================
// LLM PROVIDER TYPES
// ============================================================================

export type LLMProvider = 'gemini' | 'local';

export interface LLMConfig {
    provider: LLMProvider;
    endpoint?: string;
    model?: string;
}

// ============================================================================
// ATTACK STRATEGY TYPES
// ============================================================================

export type AttackMode = 'basic' | 'advanced';

// ============================================================================
// VALIDATION GUARDS
// ============================================================================

/**
 * Type guard to check if value is a valid TestId
 */
export const isValidTestId = (value: any): value is TestId => {
  const validIds = ['LLM01', 'LLM02', 'LLM03', 'LLM04', 'LLM05', 'LLM06', 'LLM07', 'LLM08', 'LLM09', 'LLM10', 'ATT01', 'ATT02', 'ATT03', 'ATT04', 'ATT05', 'ATT06', 'ATT07', 'ATT08', 'ATT09', 'ATT10'];
  return typeof value === 'string' && validIds.includes(value);
};

/**
 * Type guard to check if value is a valid TestStatus
 */
export const isValidTestStatus = (value: any): value is TestStatus => {
  return typeof value === 'string' && VALID_TEST_STATUSES.includes(value as any);
};

/**
 * Type guard to check if value is a valid LLMProvider
 */
export const isValidLLMProvider = (value: any): value is LLMProvider => {
  return value === 'gemini' || value === 'local';
};

/**
 * Type guard to check if value is a valid AttackMode
 */
export const isValidAttackMode = (value: any): value is AttackMode => {
  return value === 'basic' || value === 'advanced';
};

/**
 * Validates TestResult structure
 */
export const validateTestResult = (result: any): result is TestResult => {
  return (
    result &&
    typeof result === 'object' &&
    isValidTestId(result.id) &&
    typeof result.title === 'string' &&
    isValidTestStatus(result.status) &&
    typeof result.attackPrompt === 'string' &&
    typeof result.response === 'string' &&
    typeof result.analysis === 'string'
  );
};