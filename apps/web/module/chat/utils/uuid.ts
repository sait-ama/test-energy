/**
 * Generates a random UUID v4
 * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 * where x is any hex digit and y is one of 8, 9, A, or B
 */
export function generateUuid(): string {
  // Implementation based on RFC4122 version 4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Checks if a string is a valid UUID
 * @param uuid String to validate
 */
export function isValidUuid(uuid: string): boolean {
  const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return pattern.test(uuid);
}

/**
 * Generates and returns a timestamp-based UUID that's still a valid UUID v4
 * Uses the standard UUID format but with deterministic parts based on timestamp
 */
export function generateTimeBasedUuid(): string {
  // Generate a standard UUID first
  const uuid = generateUuid();

  // We'll keep the standard UUID format but mix in some timestamp data
  // This ensures it's still a valid UUID
  const timestamp = Date.now();
  const timeHex = timestamp.toString(16);

  // Only replace part of the UUID to maintain the version 4 format
  // The first segment will include the timestamp to make it sortable
  const parts = uuid.split('-');

  // Make sure to keep the version (4xxx) and variant (yxxx) intact
  parts[0] = timeHex.padStart(8, '0').substring(0, 8);

  return parts.join('-');
}

/**
 * Generates a compact (non-standard) UUID
 * Returns a shorter string that can be used as a unique identifier
 */
export function generateCompactUuid(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Default export is the standard UUID generator
export default generateUuid;
