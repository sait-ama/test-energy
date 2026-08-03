/*
remove [' и '] in start or end
 */
export const anchorBasedRegex = new RegExp(/^[\['"]+|[\]'"]+$/g);
