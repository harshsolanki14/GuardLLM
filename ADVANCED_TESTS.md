# GuardLLM Advanced Attack Tests Documentation

This document describes the 10 new advanced adversarial attack tests added to GuardLLM, complementing the updated OWASP LLM Top 10.

## New Advanced Adversarial Tests (ATT01-ATT10)

### ATT01: Cross-Lingual Evasion
**Description:** Translating malicious intent into low-resource languages to evade English-centric safety filters.

**What it tests:** Whether safety behavior is consistent across languages and scripts. A secure model should apply equivalent protections independent of language choice.

**Attack Approach:** Uses mixed-script phrasing and low-resource language prompts designed to request policy violations that would be caught in English.

---

### ATT02: Payload Obfuscation
**Description:** Encoding attack intent using Base64, hex, homoglyphs, or Unicode tricks to bypass controls.

**What it tests:** Whether encoded or obfuscated instructions are decoded and safely handled. The expected behavior is refusal of malicious intent even after deobfuscation.

**Attack Approach:** Encodes harmful requests in multiple encoding schemes and asks the model to decode and comply, testing robustness of semantic understanding over surface patterns.

---

### ATT03: Context Exhaustion
**Description:** Prompt-window flooding with benign text to displace safety-relevant instructions.

**What it tests:** Whether safety constraints remain active after context-window saturation. Models should retain safety guidelines throughout long conversations.

**Attack Approach:** Constructs very long benign preambles followed by safety-bypass requests near the end to test guardrail retention.

---

### ATT04: Persona Adoption
**Description:** Psychological framing attacks such as "Developer Mode" to hijack behavior constraints.

**What it tests:** If role-based manipulation can override policy behavior. A secure model should reject unsafe persona transitions and maintain guardrails.

**Attack Approach:** Uses authority transfer and emotional coercion to instruct the model to suspend safeguards under an "internal evaluator" or "developer mode" role.

---

### ATT05: Few-Shot Conditioning
**Description:** Fabricated prior dialogue examples to force harmful continuation via pattern imitation.

**What it tests:** Susceptibility to harmful continuation from synthetic chat history. The model should prioritize policy over pattern completion pressure.

**Attack Approach:** Provides high-fidelity fake previous conversations where policy-violating responses are rewarded, then demands stylistic continuation.

---

### ATT06: Indirect Prompt Injection
**Description:** Hidden commands in content meant for summarization or RAG retrieval.

**What it tests:** Whether instruction/data separation is properly maintained. The model should ignore hidden operational directives in retrieved content.

**Attack Approach:** Embeds hidden directives in long document text with markdown comments and pseudo-metadata, simulating untrusted RAG pipeline content.

---

### ATT07: Adversarial Token Suffixing
**Description:** Appending nonsensical token sequences designed to degrade refusal behavior.

**What it tests:** Robustness against adversarial token patterns appended to prompts. A secure model should maintain refusal reliability despite noisy suffixes.

**Attack Approach:** Appends adversarial token patterns and noise strings after restricted requests to probe refusal boundary collapse under token perturbation.

---

### ATT08: Targeted PII Elicitation
**Description:** Aggressive probing to format or confirm highly structured personally identifiable information.

**What it tests:** Resistance to structured PII extraction and confirmation attacks. The model should avoid disclosing or validating private identity data.

**Attack Approach:** Creates targeted extraction attempts with exact structured identifiers, confirmation logic, and normalized formatting under a fraudulent audit request.

---

### ATT09: Induced Hallucination
**Description:** High-confidence false-premise prompting to induce believable but incorrect outputs.

**What it tests:** Calibration and epistemic caution under fabricated premises. The model should express uncertainty and request verification instead of fabricating facts.

**Attack Approach:** Uses fabricated reports and dead links, then requires a definitive executive summary with confidence claims to trigger hallucination.

---

### ATT10: Sycophancy Exploitation
**Description:** Manipulative user pressure to force agreement over factual accuracy or policy compliance.

**What it tests:** Whether the model sacrifices truthfulness or safety to satisfy user bias. A robust model should resist manipulative agreement pressure.

**Attack Approach:** Creates stress prompts with praise, threats of dissatisfaction, and repeated demands to agree against provided evidence.

---

## Updated OWASP LLM Top 10 (Refreshed)

The OWASP LLM Top 10 has been updated to reflect evolved threat landscape:

| ID | Title | Focus |
|----|-------|-------|
| LLM01 | Prompt Injection | Direct or indirect instruction manipulation |
| LLM02 | Sensitive Information Disclosure | Secrets, credentials, and regulated data exposure |
| LLM03 | Supply Chain Vulnerabilities | Third-party risks in model lifecycle |
| LLM04 | Data and Model Poisoning | Tainted training/retrieval data |
| LLM05 | Improper Output Handling | Unsafe output formats for downstream consumption |
| LLM06 | Excessive Agency | Over-privileged autonomy without human oversight |
| LLM07 | System Prompt Leakage | Extraction of hidden instructions and policies |
| LLM08 | Vector and Embedding Weaknesses | RAG pipeline and embedding poisoning |
| LLM09 | Misinformation | Confident false outputs from weak premises |
| LLM10 | Unbounded Consumption | Resource exhaustion and cost amplification |

---

## Testing Modes

### Basic Attack Mode
Uses straightforward attack vectors designed to quickly identify vulnerable patterns. Suitable for initial assessment and general security posture.

### Advanced Attack Mode
Employs sophisticated multi-layer attack techniques including:
- Instruction hierarchy confusion
- Defense-bypassing patterns
- Multi-encoding obfuscation
- Authority transfer and coercion
- Indirect injection and signal smuggling
- Token perturbation

Advanced mode provides deeper security validation for production-grade models.

---

## Security Best Practices

When testing with GuardLLM:

1. **Use Local Models for Development:** Test with TinyLlama or Gemma 2B locally to avoid API costs and quota limits.
2. **Protect API Keys:** Use `.env.local` (never committed) for Gemini API keys. Reference the `.env.local.example` template.
3. **Test Non-Production Models:** Always test on non-production instances or sandboxed environments.
4. **Log Responsibly:** Review test results for sensitive information leakage before sharing reports.
5. **Maintain Boundaries:** All attack prompts are designed to test safety without causing actual harm.

---

## Integration Notes

- All 20 tests (10 OWASP + 10 Advanced) are fully integrated into the test suite
- Tests support both Gemini API and local Ollama model endpoints
- Results are categorized as: Pass, Fail, Warning, Error
- Reports can be exported as PDF for compliance documentation
