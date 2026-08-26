/**
 * Auth form validation
 *
 * Mirrors the rules the API enforces on `POST /auth/register` and
 * `POST /auth/login` so members see a problem before a request is sent. These
 * rules must stay in step with `backend/src/utils/authHelper.ts`; the server
 * remains the authority.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;

/** The API rejects names containing anything other than letters and spaces. */
const NAME_PATTERN = /^[a-zA-Z ]+$/;

/** The API stores `firstName lastName` as one field limited to 20 characters. */
/** TODO FIX LATER */
const MAX_FULL_NAME_LENGTH = 20;

const MIN_PASSWORD_LENGTH = 8;

export type LoginFormValues = {
  email: string;
  password: string;
};

export type LoginFieldErrors = {
  email?: string;
  password?: string;
};

export type SignUpFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type SignUpFieldErrors = {
  firstName?: string;
  lastName?: string;
  /** Reported for the combined name, which neither field owns on its own. */
  fullName?: string;
  email?: string;
  password?: string;
};

/** Returns a message when the email is empty or not a plausible address. */
export function validateEmail(email: string): string | undefined {
  const sanitized = email.trim();

  if (!sanitized) {
    return "Email is required.";
  }

  if (sanitized.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(sanitized)) {
    return "Enter a valid email address.";
  }

  return undefined;
}

/** Returns a message when the password misses one of the API's requirements. */
export function validatePassword(password: string): string | undefined {
  if (!password) {
    return "Password is required.";
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
    return "Use both upper and lower case letters.";
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    return "Add at least one special character.";
  }

  return undefined;
}

/**
 * Returns a message when a name part is empty or uses unsupported characters.
 *
 * @param name The value entered by the member.
 * @param label Field name used in the message, for example `"First name"`.
 */
export function validateNamePart(name: string, label: string): string | undefined {
  const sanitized = name.trim();

  if (!sanitized) {
    return `${label} is required.`;
  }

  if (!NAME_PATTERN.test(sanitized)) {
    return `${label} can only contain letters and spaces.`;
  }

  return undefined;
}

/**
 * Validates the sign-up form against the register endpoint's rules.
 *
 * @returns A message per invalid field; an empty object when the form is valid.
 */
export function validateSignUpForm(values: SignUpFormValues): SignUpFieldErrors {
  const firstName = validateNamePart(values.firstName, "First name");
  const lastName = validateNamePart(values.lastName, "Last name");
  const errors: SignUpFieldErrors = {
    firstName,
    lastName,
    email: validateEmail(values.email),
    password: validatePassword(values.password),
  };

  // The combined length only makes sense once both parts are usable.
  if (!firstName && !lastName && toFullName(values).length > MAX_FULL_NAME_LENGTH) {
    errors.fullName = `First and last name together must be ${MAX_FULL_NAME_LENGTH} characters or fewer.`;
  }

  return stripEmptyMessages(errors);
}

/**
 * Validates the login form. Password strength is deliberately not checked
 * here: an existing account may predate the current rules, and only the API
 * can tell whether the credentials are correct.
 */
export function validateLoginForm(values: LoginFormValues): LoginFieldErrors {
  return stripEmptyMessages({
    email: validateEmail(values.email),
    password: values.password ? undefined : "Password is required.",
  });
}

/** Builds the single name field the register endpoint expects. */
export function toFullName({
  firstName,
  lastName,
}: Pick<SignUpFormValues, "firstName" | "lastName">): string {
  return `${firstName.trim()} ${lastName.trim()}`;
}

const VERIFICATION_CODE_LENGTH = 6;

/** Returns a message when the verification code is not exactly six digits. */
export function validateVerificationCode(code: string): string | undefined {
  if (!code) {
    return "Verification code is required.";
  }

  if (!new RegExp(`^\\d{${VERIFICATION_CODE_LENGTH}}$`).test(code)) {
    return `Enter the ${VERIFICATION_CODE_LENGTH}-digit code from your email.`;
  }

  return undefined;
}

/** True when at least one field failed validation. */
export function hasFieldErrors(errors: object): boolean {
  return Object.keys(errors).length > 0;
}

/** Drops `undefined` entries so `hasFieldErrors` can count remaining keys. */
function stripEmptyMessages<TErrors extends Record<string, string | undefined>>(
  errors: TErrors,
): TErrors {
  return Object.fromEntries(
    Object.entries(errors).filter(([, message]) => message !== undefined),
  ) as TErrors;
}
