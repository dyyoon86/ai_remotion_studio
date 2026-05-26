// Lightweight class-name joiner — keeps deps minimal.
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(" ");
}
