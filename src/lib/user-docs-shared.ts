// Limits for readers' own documents, shared by the upload form and the server.
export const USER_DOC_MAX_BYTES = 20 * 1024 * 1024;
export const USER_DOC_MAX_COUNT = 30;
/** All of one reader's files together, so a script can't fill the store with 20 MB uploads. */
export const USER_DOC_MAX_TOTAL_BYTES = 200 * 1024 * 1024;
