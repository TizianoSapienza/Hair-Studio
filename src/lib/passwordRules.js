// Deve restare in sync con backend/src/utils/schemas/authSchemas.js.
// PASSWORD_REGEX è composta dagli stessi 4 criteri usati dalla checklist UI (checkPasswordRules)
// invece di due definizioni parallele che potrebbero disallinearsi.
const RULES = {
  letter: { test: (p) => /[A-Za-z]/.test(p), pattern: "(?=.*[A-Za-z])" },
  number: { test: (p) => /\d/.test(p), pattern: "(?=.*\\d)" },
  special: { test: (p) => /[^A-Za-z\d]/.test(p), pattern: "(?=.*[^A-Za-z\\d])" },
  len: { test: (p) => p.length >= 8, pattern: ".{8,}" },
};

export const PASSWORD_REGEX = new RegExp(
  `^${RULES.letter.pattern}${RULES.number.pattern}${RULES.special.pattern}${RULES.len.pattern}$`
);

export function checkPasswordRules(password) {
  return {
    len: RULES.len.test(password),
    letter: RULES.letter.test(password),
    number: RULES.number.test(password),
    special: RULES.special.test(password),
  };
}
