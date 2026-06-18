import { Font } from '@react-pdf/renderer';

export const PDF_FONT_REGULAR = 'Onest';
export const PDF_FONT_BOLD = 'Onest-Bold';

const ONEST_REGULAR =
  'https://fonts.gstatic.com/s/onest/v9/gNMZW3F-SZuj7zOT0IfSjTS16cPh9R-Zsg.ttf';
const ONEST_BOLD =
  'https://fonts.gstatic.com/s/onest/v9/gNMZW3F-SZuj7zOT0IfSjTS16cPhEhiZsg.ttf';

let registered = false;

export function registerPdfFonts() {
  if (registered) return;
  registered = true;

  Font.register({
    family: PDF_FONT_REGULAR,
    src: ONEST_REGULAR,
  });

  Font.register({
    family: PDF_FONT_BOLD,
    src: ONEST_BOLD,
  });
}
