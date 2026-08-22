# Frontend Engineering Standards

This document defines the expected structure, documentation, styling, and
quality of frontend code in this repository. Follow these standards even when
older code uses a different pattern. Existing code is not automatically an
example of current best practice.

## Core principles

1. Write code that another contributor can understand and safely modify.
2. Keep screens focused on presentation and user interaction.
3. Keep API communication, data conversion, and reusable UI in their relevant
   modules.
4. Prefer simple, explicit code over premature abstractions.
5. Do not submit code you cannot explain, test, or maintain.
6. Make precise changes and preserve unrelated work.

## File and route structure

- New React Native screens and components should use TypeScript (`.tsx`).
- API request functions and API response types belong in `src/lib/api/`.
- Feature constants and pure feature utilities belong in `src/lib/<feature>/`.
- Reusable UI belongs in `src/components/`.
- A component used by only one small screen may remain in that screen until
  extraction makes the code easier to understand.
- Expo Router uses file-based routes:

```text
screens/events/index.tsx        -> /screens/events
screens/events/[eventId].tsx    -> /screens/events/:eventId
screens/events/create-event.tsx -> /screens/events/create-event
```

Use `index.tsx` when a screen is the default route for its folder. Use a named
file when the route should include that name. If it is unclear which screen
should own a folder's default route, agree on the route structure as a team
before naming or moving files.

## Program headers

Every screen, reusable component module, API module, and substantial utility
module must begin with a short program header. State what the module owns and,
when useful, what it intentionally does not own.

```tsx
/**
 * Manage Member Game Screen
 *
 * Shows organisers the confirmed players, remaining capacity, and waitlist
 * state for one game. Network operations are delegated to the events API.
 */
```

Do not use headers that only repeat the filename or contain stale update dates.

## Function and component documentation

Add a function header to:

- exported functions;
- screen components;
- reusable components;
- API functions;
- helpers containing calculations, conversions, or non-obvious behaviour.

A short component may use a one-line header:

```tsx
/** Renders one confirmed participant in the game roster. */
function PlayerRow({ player }: PlayerRowProps) {
  // ...
}
```

Use a longer header when inputs, output, side effects, or constraints require
explanation:

```ts
/**
 * Converts the selected local date and time into the ISO timestamp expected
 * by the events API.
 *
 * @param date Calendar date selected by the member.
 * @param time Selected hour and minute in local time.
 * @returns An ISO-8601 timestamp suitable for the request payload.
 */
function toEventTimestamp(date: Date, time: EventTime): string {
  // ...
}
```

Do not leave incomplete documentation such as `@param {???}`. Do not document
obvious language behaviour.

## Comments

Comments should explain intent, constraints, or reasoning—not translate JSX
into English.

Useful comment:

```tsx
// Clamp progress because participant data may briefly exceed capacity while
// bookings and cancellations are being reconciled.
const percentage = Math.min((participantCount / capacity) * 100, 100);
```

Unhelpful comment:

```tsx
// Render a view.
<View />
```

Use section comments in long screens where they make the visual structure
easier to scan. Remove comments that no longer describe the code.

## Components

- Give components one clear responsibility.
- Extract a component when it is reused, independently complex, or makes its
  parent difficult to read.
- Do not create a generic abstraction before one concrete implementation is
  understood.
- Define reusable components outside screen functions. Defining a component
  inside its parent recreates its component type on every render.
- Pass data and callbacks through props instead of relying on hidden state.
- Name callbacks by intent, for example `handleCreateGame` or
  `handleTimeSelected`, rather than `doThing`.

## Modularity and reuse

Modularise code when doing so creates a clear boundary, improves reuse, or
makes a feature easier to understand and test.

- Keep screen files focused on layout, screen-level state, and coordination.
- Move API communication and server-facing types into `src/lib/api/`.
- Move pure calculations, formatting, and feature constants into
  `src/lib/<feature>/`.
- Move reusable visual elements into `src/components/`.
- Prefer small modules with one clear responsibility and descriptive names.
- Pass dependencies through parameters or props instead of importing hidden
  screen state into utility modules.
- Reuse an established component before creating a near-duplicate.
- Keep code local when it is short, used once, and easier to understand beside
  its caller.

Do not split code solely to reduce file length. Excessive abstraction can hide
simple behaviour across several files and make maintenance harder. A useful
module should have a clear reason to exist and an interface that is simpler
than its implementation.

## Types and state

- Avoid `any`. Model the data or use `unknown` until it is validated.
- Keep state in its useful domain type. For example, store a selected date as
  `Date`, not as a formatted display string.
- Use arrays (`string[]`) rather than one-element tuple types (`[string]`) when
  the number of entries varies.
- Use `boolean` and `number` unless a literal type such as `true` or `0` is
  genuinely required.
- Use server-facing response types at the API boundary. Map them to a simpler
  UI model when the screen does not need the complete response.
- Preserve the API's field names in API payload and response types unless an
  explicit mapping function converts them.

Example:

```ts
export type EventTime = {
  hour: number;
  minutes: number;
};

const [teeTime, setTeeTime] = useState<EventTime>({
  hour: 9,
  minutes: 0,
});
```

## Styling and colours

Use Uniwind/Tailwind semantic theme tokens wherever possible:

```text
bg-background
bg-card
bg-muted
text-foreground
text-muted-foreground
text-primary
text-secondary
text-accent
border-border
```

Do not hard-code project colours in screens or components.

```tsx
// Avoid
<Text style={{ color: '#183B61' }} />

// Prefer
<Text className="text-secondary" />
```

Some native props, including `Ionicons.color` and
`TextInput.placeholderTextColor`, cannot consume a class name. Obtain those
colours through `useThemeColors()`:

```tsx
const { mutedForeground, primary } = useThemeColors();

<Ionicons color={primary} name="calendar-outline" size={20} />
<TextInput placeholderTextColor={mutedForeground} />
```

Only use custom colour values when they represent external branding, image
overlays, or a design value that does not belong in the theme. Repeated design
colours must be added as semantic theme tokens instead.

## API boundaries and stubs

API functions belong in `src/lib/api/<feature>.ts`, not inside screen files.
Screens should call typed functions and handle loading, success, empty, and
error states.

When an endpoint is not ready, create an explicitly named and documented stub:

```ts
/**
 * Stub for GET /member-games/my-created.
 * Replace the demo return value with `apiRequest` when integration begins.
 */
export async function getMyGamesStub(): Promise<MemberGameSummary[]> {
  return DEMO_MEMBER_GAMES;
}
```

Stub requirements:

- Include `Stub` in the function name.
- State the intended endpoint in its documentation when known.
- Return data matching the declared response type.
- Keep demo data beside the stub or in a clearly named fixture module.
- Do not hide unfinished integration behind a production-sounding function.
- Do not invent API fields or endpoint behaviour. Record uncertainty with a
  focused `TODO` and confirm the contract before integration.

When the endpoint is ready, replace the stub with a typed request:

```ts
export async function getMyCreatedGames(): Promise<Event[]> {
  return apiRequest<Event[]>('/member-games/my-created');
}
```

## Forms and keyboard behaviour

- Use controlled inputs with explicit state.
- Validate before submitting and display actionable errors near the relevant
  field.
- Disable repeated submission while a request is in progress.
- Use `KeyboardAvoidingView` and a scrollable form for input-heavy screens.
- Use `keyboardShouldPersistTaps="handled"` where controls must remain usable
  while the keyboard is open.
- Store dates as `Date` objects and format them only for display or API
  conversion.
- Prefer maintained native date/time picker libraries over custom calendar
  implementations.

## Asynchronous screen loading

Every asynchronously loaded screen must represent these states deliberately:

1. loading;
2. successful data;
3. empty or not found;
4. request failure.

Avoid updating state after a screen unmounts. Where cancellation is not
available, guard the result:

```tsx
useEffect(() => {
  let screenIsMounted = true;

  loadGames().then((games) => {
    if (screenIsMounted) setGames(games);
  });

  return () => {
    screenIsMounted = false;
  };
}, []);
```

## Accessibility

- Every interactive control must expose `accessibilityRole`.
- Icon-only controls must have a meaningful `accessibilityLabel`.
- Use `accessibilityState` for selected, checked, expanded, or disabled state.
- Maintain a touch target of approximately 44 by 44 points.
- Do not communicate status using colour alone.
- Ensure text can wrap rather than being silently clipped.

## Dependencies

Do not implement complex platform controls from scratch when a maintained,
Expo-compatible package already solves the problem. This commonly applies to
date pickers, secure storage, gestures, maps, and image handling.

Before adding a dependency:

1. verify compatibility with the current Expo SDK;
2. prefer `npx expo install <package>` for Expo-managed native packages;
3. confirm whether it works in Expo Go or requires a development build;
4. document why the dependency is needed;
5. avoid overlapping packages that solve the same problem.

## Verification

Before considering frontend work complete:

```bash
npm run typecheck
npx eslint <changed-files>
git diff --check
```

Also verify the affected states on a device or simulator:

- initial state;
- loading and disabled states;
- populated state;
- empty state;
- validation and API errors;
- keyboard open;
- small screen size;
- light and dark themes where supported.

## Definition of done

Frontend work is complete when:

- the requested behaviour works;
- the code follows this document;
- unfinished integration is clearly represented by typed stubs;
- there are no unexplained hard-coded project colours;
- documentation explains non-obvious decisions;
- accessibility labels and roles are present;
- linting and typechecking pass, or unrelated existing failures are reported;
- the contributor can explain the code and safely modify it later.
