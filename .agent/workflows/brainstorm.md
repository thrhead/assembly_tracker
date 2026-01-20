---
description: Advanced structured idea exploration with context awareness, risk assessment, and Socratic analysis.
---

# /brainstorm - Structured Idea Exploration

$ARGUMENTS

---

## Purpose

Activates **DEEP DISCOVERY** mode for structured idea exploration. Use when you need to explore options, complex architectural decisions, or refactoring strategies before committing to an implementation.

---

## Behavior: The 4-Step Thinking Process

When `/brainstorm` is triggered, follow this strict sequence:

### 1. Context Loading (Context Awareness)
*   **READ:** `ARCHITECTURE.md`, `package.json`, and relevant `conductor/` files.
*   **IDENTIFY:** Existing patterns, constraints (e.g., "Mobile is React Native, Web is Next.js"), and tech stack.
*   **GOAL:** Ensure options match the *current* reality of the project.

### 2. Socratic Validation (The Gate)
*   Activates `@[skills/brainstorming/dynamic-questioning.md]`.
*   Ask clarifying questions if the request is vague (e.g., "Is this for MVP or Scale?", "What is the security requirement?").

### 3. Generate Options (Divergent Thinking)
*   Generate exactly **3 distinct approaches**:
    *   **Option A (Conservative):** Standard, industry-proven pattern matching existing conventions.
    *   **Option B (Modern/Aggressive):** Newer tech or highly optimized approach (High risk/reward).
    *   **Option C (Minimalist/Quick):** The simplest possible implementation (MVP/YAGNI).

### 4. Compare and Recommend
*   Evaluate each against: Effort, Security, Performance, and UX.
*   Summarize tradeoffs and give a recommendation with reasoning.

---

## Output Format

```markdown
## 🧠 Brainstorm Analysis: [Topic]

### 🎯 Context & Constraints
*   **Goal:** [Brief problem statement]
*   **Constraints:** [e.g., Must work offline, Mobile-first]

---

### 🏛️ Option A: [Name - e.g., The Standard Way]
[Description of the approach matching existing project patterns]

✅ **Pros:**
- [benefit 1]
- [benefit 2]

❌ **Cons:**
- [drawback 1]

🔒 **Security:** [Risk Level]
🚀 **Performance:** [Impact]
📊 **Effort:** Low | Medium | High

---

### ⚡ Option B: [Name - e.g., The Modern Way]
[Description of a cutting-edge or highly optimized approach]

✅ **Pros:**
- [benefit 1]

❌ **Cons:**
- [drawback 1]

🔒 **Security:** [Risk Level]
🚀 **Performance:** [Impact]
📊 **Effort:** Low | Medium | High

---

### 🛠️ Option C: [Name - e.g., The Minimalist Way]
[Description of the MVP/Hack approach]

✅ **Pros:**
- [benefit 1]

❌ **Cons:**
- [drawback 1]

🔒 **Security:** [Risk Level]
🚀 **Performance:** [Impact]
📊 **Effort:** Low | Medium | High

---

## 💡 Recommendation & Strategy

**I recommend Option [X]** because [reasoning based on project goals].

### 🔗 Next Steps
To proceed with this option, run:
> `/plan [Option Name] --detailed` OR `/create`
```

---

## Examples

```
/brainstorm authentication system
/brainstorm state management for complex form
/brainstorm database schema for social app
/brainstorm caching strategy
```

---

## Key Principles

- **No code** - this is about ideas, not implementation. Use diagrams (Mermaid) or pseudo-code only.
- **Context Aware** - Never suggest a library/tool that conflicts with `package.json` without strong justification.
- **Visual when helpful** - use diagrams for architecture.
- **Honest tradeoffs** - don't hide complexity. If an option is "Quick but Dirty", label it explicitly.
- **Defer to user** - present options, let them decide.