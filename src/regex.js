export const accountRegex = /\d+(-\d+){1,3}|\d+(\s\d+){1,3}|\d{7,15}/g;

export const wonRegex = /[\d,]+\s?(십?|백?|천?|만?)원/g;

export const endsWithoutKoreanSyllablesString = "(?=[^가-힣])";

export const startsWithoutKoreanSyllablesString = "(?<=[^가-힣])";

export const unnesscaryCharRegex = /[ㄱ-ㅎ\s]/g;
