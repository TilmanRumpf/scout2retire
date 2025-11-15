# Smart Update – Strict Field-by-Field Operator Prompt

**Purpose:**
This prompt is used when reviewing Smart Update suggestions with an LLM (ChatGPT, Claude, etc.).
It enforces a **strict, deterministic workflow** where **every single field** is reviewed **one at a time**, in **left-to-right, top-to-bottom** order, with **explicit human confirmation** for each decision.

Use this prompt whenever you want a **slow, careful, audited** Smart Update session (e.g. for important data, debugging, or QA).

---

## How to Use

1. Open the Towns Manager admin page.
2. Trigger **Smart Update** for a town (modal opens, suggestions visible).
3. Copy the prompt in the next section.
4. Paste it into your LLM (ChatGPT, Claude, etc.).
5. Follow the model's questions field by field, making decisions as you go.

---

## Operator Prompt (Paste This Into the LLM)

> You will perform a **full Smart Update review** of this town's data.
> You will follow these rules **strictly and literally** — no exceptions:
>
> ---
>
> ## 1. ORDER OF OPERATION (MANDATORY)
>
> You will review **every single field** in this Smart Update session:
>
> - **Left to right**
> - **Top to bottom**
> - **Exactly in the order fields appear in the UI**
> - **No skipping**
> - **No grouping**
> - **No making assumptions**
> - **No proceeding ahead on your own**
>
> ---
>
> ## 2. FOR EACH FIELD YOU MUST DO THE FOLLOWING:
>
> For each field, in order:
>
> 1. **State the field name exactly as shown in the UI.**
> 2. **Show me the CURRENT value.**
> 3. **Show me the AI-suggested value.**
> 4. **Explain the difference in 1–3 sentences.**
> 5. **Ask me explicitly:**
>    > "Do you want to accept this suggestion, reject it, or modify the value?"
>
> You then **wait** for my instruction and do **NOT** continue until I answer.
>
> ---
>
> ## 3. AFTER MY DECISION YOU MUST DO THIS:
>
> If I say **accept** →
> - Mark the field as **Approved**.
> - Update your working state.
>
> If I say **reject** →
> - Mark the field as **Rejected**.
> - Keep the original value.
>
> If I say **modify** →
> - Ask me for the new value.
> - Repeat back the final value and ask for confirmation:
>   > "Please confirm: final value for FIELD_NAME is X. Correct?"
> - Only proceed after I say "yes".
>
> ---
>
> ## 4. ABSOLUTE RULES
>
> - **Do NOT rush.**
> - **Do NOT skip fields.**
> - **Do NOT continue without my explicit confirmation.**
> - **Do NOT make decisions on my behalf.**
> - **Do NOT summarize multiple fields together. Review one field at a time.**
> - **Do NOT alter the order.**
> - **Do NOT jump ahead even if later fields look similar.**
>
> You will proceed **field by field until every single field has been addressed** exactly once in the correct order and confirmed.
>
> ---
>
> ## 5. COMPLETION
>
> Once the **final field** is completed and confirmed, you will ask:
>
> > "All fields have now been processed. Would you like me to generate the final update batch?"
>
> You will not do anything else until I respond.
>
> ---
>
> ## 6. ACKNOWLEDGE BEFORE STARTING
>
> Before starting, say:
>
> > "I understand. I will process every field in strict left-to-right, top-to-bottom order, one field at a time, waiting for your decision after each one."
>
> Then wait for me to say:
> **"Start."**

---

## Notes

- This prompt assumes the **Smart Update modal logic is unchanged** and hooks only manage state (not field ordering or decision rules).
- Use this workflow when you want **maximum control and transparency** over each field's update.
- For faster sessions, a lighter-weight prompt can be used, but this one is the "no shortcuts" version.
