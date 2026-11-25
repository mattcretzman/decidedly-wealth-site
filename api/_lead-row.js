// One layout for every row in the leads sheet (DWM_BOOK_SHEET_ID, Sheet1).
// Every lead endpoint writes through leadRow() so columns never drift again.
//
//  A Timestamp      F Referrer       K LinkedIn          P Phone          U Outcome      (team fills in)
//  B First Name     G UTM Source     L LinkedIn lookup   Q Interest       V Meeting date (team fills in)
//  C Last Name      H UTM Medium     M RJ LinkedIn       R Message
//  D Email          I UTM Campaign   N Drips sent        S Ad click id    (gclid / msclkid / li_fat_id ...)
//  E Source         J Self-Attribution  O Weekly Decision  T Landing page
//  W RJ emails (T25: last step sent @time)  X RJ emails stopped (reason)  Y Calculator range (for T25 B1)
//
// J is written later by book-attribution.js, K-M by the lead follow-up job, N-O by book-drip.js,
// U-V by the team. leadRow() leaves those blank. Rows before Nov 20 2026 are older layouts;
// contact-form rows from then hold phone/interest/message/source in E-H (the follow-up job knows).

const RANGE = 'Sheet1!A:Y';

// extra = server-set columns only (never from the form body): { t25_w, calc_range }
function leadRow(b = {}, extra = {}) {
  const s = (v) => (v == null ? '' : String(v)).slice(0, 2000);
  const click = b.click_id ? `${b.click_id_type || 'click'}:${b.click_id}` : '';
  return [
    new Date().toISOString(),                 // A
    s(b.firstName), s(b.lastName), s(b.email), // B C D
    s(b.source),                               // E
    s(b.referrer || b.first_referrer),         // F
    s(b.utm_source), s(b.utm_medium), s(b.utm_campaign), // G H I
    '', '', '', '', '', '',                    // J K L M N O
    s(b.phone), s(b.interest), s(b.message),  // P Q R
    s(click),                                  // S
    s(b.landing_page),                         // T
    '', '',                                    // U V
    s(extra.t25_w), '', s(extra.calc_range)            // W X Y
  ];
}

module.exports = { leadRow, RANGE };
