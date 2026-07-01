export const NULL_BYTE = 0;
export const HORIZONTAL_TAB_BYTE = 9;
export const LINE_FEED_BYTE = 10;
export const FORM_FEED_BYTE = 12;
export const CARRIAGE_RETURN_BYTE = 13;
export const FIRST_PRINTABLE_ASCII_BYTE = 32;
export const MAX_CONTROL_BYTE_RATIO = 0.02;

export const TEXT_CONTROL_BYTES = new Set([
  HORIZONTAL_TAB_BYTE,
  LINE_FEED_BYTE,
  FORM_FEED_BYTE,
  CARRIAGE_RETURN_BYTE,
]);
