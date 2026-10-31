// Where notes from the desk notepad get saved.
//
// There's no database yet, so this returns false and the visitor's
// mail app opens with their note already written (nothing is lost).
// When you connect a database, save the enquiry here and return true.
//
// Example later (any database works):
//   await db.insert(enquiries).values(enquiry);
//   return true;

export async function saveEnquiry(enquiry) {
  void enquiry; // { name, email, message, createdAt, userAgent }
  return false;
}