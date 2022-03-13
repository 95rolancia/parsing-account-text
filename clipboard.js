var INST_INFO = {
  지역농축협: '012',
  케이뱅크: '089',
  국민투자: '218',
  국민증권: '218',
  농협증권: '247',
  농협투자: '247',
  지역농협: '012',
  지역축협: '012',
  신한증권: '278',
  신한투자: '278',
  토스뱅크: '092',
  신한금융: '278',
  KB투자: '218',
  KB증권: '218',
  K뱅크: '089',
  케뱅: '089',
  국민: '004',
  KB: '004',
  기업: '003',
  IBK: '003',
  농협: '011',
  축협: '011',
  NH투자: '247',
  NH증권: '247',
  NH: '011',
  신한: '088',
  씨티: '027',
  CITI: '027',
  우리: '020',
  하나: '081',
  부산: '032',
  광주: '034',
  카카오: '090',
  카뱅: '090',
  토스: '092',
};

var regBlankPtn = /\s|\,|\-/g; // 공백, ",", "-" 패턴
var MIN_DIS_BTW_BANK_ACCT = 8; // 계좌번호와 금융기관 사이의 글자 거리
var MIN_LEN_ACCT = 7; // 계좌번호 최소 길이
var MAX_LEN_ACCT = 15; // 계좌번호 최대 길이
var MAX_INST_CNT = 5; // 이체 정보 최대 개수

/** get amount
 * @param {string} txt
 * @returns {number} 금액(원)
 */

function getWonFromTxt(txt) {
  var result = null;
  var matched = txt.match(/\d+원/);

  if (matched) {
    result = matched[0].substring(0, matched[0].length - 1);
  }
  return result;
}

/**
 * matchAll
 * @param {string} rx
 * @param {string} txt
 * @returns {IterableIterator<RegExpMatchArray>} object iterator
 */

function matchAll(rx, txt) {
  rx = new RegExp(rx, 'g');
  let cap = [];
  let all = [];
  while ((cap = rx.exec(txt)) !== null) all.push(cap);
  return all;
}

/**
 * 금융기관명들의 정규표현식 문자열을 반환하는 함수
 *
 * @returns {string} 케이|K뱅크|국민 ...
 */

function getInstArrRegex() {
    var regText = '';

    for (var key in INST_INFO) {
      regText += key + '|';
    }
  
    return regText.substring(0, regText.length - 1);
}

/**
 * 금융기관, 계좌번호, 금액을 파싱하는 정규표현식 튜플을 반환하는 함수
 * 1. 계좌번호 - 금융기관
 * 2. 금융기관 - 계좌번호
 *
 * @returns {[RegExp, RegExp]} 케이|K뱅크|국민 ...
 */

function getParsingAcctRegex() {
  var acctFirstBasicStr =
    '(\\d{' +
    MIN_LEN_ACCT +
    ',' +
    MAX_LEN_ACCT +
    '})(\\D{0,' +
    MIN_DIS_BTW_BANK_ACCT +
    '}(?=\\d*))(';

  var acctLastBasicStr =
    ')(\\D{0,' +
    MIN_DIS_BTW_BANK_ACCT +
    '}(?=\\d*))(\\d{' +
    MIN_LEN_ACCT +
    ',' +
    MAX_LEN_ACCT +
    '})';

  var instArr = getInstArrRegex();

  var acctFirstParsingRegex = new RegExp(acctFirstBasicStr + instArr + ')', 'gi');
  var acctLastParsingRegex = new RegExp('(' + instArr + acctLastBasicStr, 'gi');

  return [acctFirstParsingRegex, acctLastParsingRegex];
}

/**
 * 텍스트로부터 이체정보에 관한 정보를 파싱하는 함수
 * @typedef {object} AcctInfo
 * @property {string} instCode
 * @property {string} instAccount
 * @property {string} txAmt
 * 
 * @typedef {object} ParsedAcctInfo
 * @property {string} resultCode
 * @property {AcctInfo[]} candidates
 * 
 *
 * @param {string} txt 클립보드에서 가져온 텍스트
 * @returns {ParsedAcctInfo} {resultCode(반환 타입), candidates: [{이체정보}, ...]}
 */

function getParsedAcctFromTxt(txt) {
  // 공백없애기 전에 금액 먼저 찾기
  var txAmt = getWonFromTxt(txt) || '';

  txt = txt.replace(regBlankPtn, '');

  var parsingAcctRegex = getParsingAcctRegex();

  var parsingAcctFirstRegex = parsingAcctRegex[0];
  var parsingAcctLastRegex = parsingAcctRegex[1];

  var candidates = [];
  // 계좌번호 - 금융기관명 순서
  var acctFirstResult = matchAll(parsingAcctFirstRegex, txt);
  for (var key of acctFirstResult) {
    var temp = key[1];
    key[1] = key[3];
    key[3] = temp;
    candidates.push(key);
  }
  // 금융기관명 - 계좌번호 순서
  var acctLastResult = matchAll(parsingAcctLastRegex, txt);
  for (var key of acctLastResult) {
    candidates.push(key);
  }

  var result = [];

  for (var candidate of candidates) {
    var instName = candidate[1];
    var instCode = INST_INFO[instName];
    var instAccount = candidate[3];

    result.push({ instCode, instAccount, txAmt });
  }

  result = result.slice(0, MAX_INST_CNT);

  return {
    resultCode: result.length >= 2 ? '02' : '01', // 01: 이체 정보가 1개일 때, 02: 이체 정보가 2개 이상일 때
    candidates: result,
  };
}

// 함수명 변경하기 전에 호환성을 위해
function getRegResult(txt) {
  return getParsedAcctFromTxt(txt);
}

// 테스트 용도로 export 
module.exports = {
    getRegResult
}