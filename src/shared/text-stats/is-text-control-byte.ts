import {
  FIRST_PRINTABLE_ASCII_BYTE,
  TEXT_CONTROL_BYTES,
} from './text-control-byte-constants';

export function isTextControlByte(byte: number): boolean {
  const isControlRangeByte = byte < FIRST_PRINTABLE_ASCII_BYTE;
  const isAllowedTextControlByte = TEXT_CONTROL_BYTES.has(byte);

  return isControlRangeByte && !isAllowedTextControlByte;
}
