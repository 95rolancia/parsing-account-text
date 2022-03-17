var INST_INFO = {
  뱅크오브아메리카: "060",
  지역농축협: "012",
  카카오증권: "288",
  카카오페이: "288",
  펀드온라인: "294",
  케이뱅크: "089",
  국민투자: "218",
  국민증권: "218",
  농협증권: "247",
  농협투자: "247",
  지역농협: "012",
  지역축협: "012",
  NH투자: "247",
  NH증권: "247",
  신한증권: "278",
  신한투자: "278",
  신한금융: "278",
  CITI: "027",
  토스뱅크: "092",
  TOSS: "092",
  하나투자: "270",
  하나증권: "270",
  하나금융: "270",
  하나은행: "081",
  한국산업: "002",
  중국공상: "062",
  중국건설: "067",
  HSBC: "054",
  이베스트: "265",
  한국투자: "243",
  에스케이: "266",
  KB투자: "218",
  KB증권: "218",
  K뱅크: "089",
  IBK: "003",
  카카오: "090",
  DGB: "031",
  KDB: "002",
  새마을: "045",
  우체국: "071",
  도이치: "055",
  BOA: "060",
  BNP: "061",
  파리바: "061",
  메리츠: "287",
  유안타: "209",
  HMC: "263",
  BNK: "224",
  KTB: "227",
  LIG: "292",
  케이프: "292",
  케뱅: "089",
  국민: "004",
  KB: "004",
  기업: "003",
  농협: "011",
  축협: "011",
  NH: "011",
  신한: "088",
  씨티: "027",
  시티: "027",
  우리: "020",
  하나: "081",
  부산: "032",
  광주: "034",
  카뱅: "090",
  토스: "092",
  제일: "023",
  SC: "023",
  경남: "039",
  대구: "031",
  산림: "064",
  산업: "002",
  저축: "050",
  MG: "045",
  수협: "007",
  신협: "048",
  전북: "037",
  제주: "035",
  공상: "062",
  건설: "067",
  모간: "057",
  JP: "057",
  교보: "261",
  대신: "267",
  대우: "238",
  미래: "238",
  대국: "290",
  삼성: "240",
  신영: "291",
  유진: "280",
  키움: "264",
  포스: "294",
  하이: "262",
  한투: "243",
  한화: "269",
  현대: "263",
  DB: "279",
  동부: "279",
  SK: "266"
};

var unnecessaryRegex = /[^\w가-힣]/g;

var MIN_LEN_ACCT = 7; // 계좌번호 최소 길이
var MAX_LEN_ACCT = 15; // 계좌번호 최대 길이
var MAX_INST_CNT = 5; // 이체 정보 최대 개수
var MIN_DIS_BTW_ACCT_N_INST = 5; // 계좌번호와 금융기관명 사이 거리
var wonRegex = /(\d{1,3}(,\d{3}){0,2}(\s{0,2})(원))|(\d{1,9}(\s{0,2})(원))/;

/** get amount
 * @param {string} txt
 * @returns {number} 금액(원)
 */

function getWonFromTxt(txt) {
  var result = null;
  var matched = txt.match(wonRegex);

  if (matched) {
    var temp = matched[0].replace(/,/g, "");
    result = temp.substring(0, temp.length - 1);
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
  rx = new RegExp(rx, "g");
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
  var regText = "";

  for (var key in INST_INFO) {
    regText += key + "|";
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
    "(\\d{" +
    MIN_LEN_ACCT +
    "," +
    MAX_LEN_ACCT +
    "})(.{0," +
    MIN_DIS_BTW_ACCT_N_INST +
    "})(";

  var acctLastBasicStr =
    ")(\\D{0," +
    MIN_DIS_BTW_ACCT_N_INST +
    "})(\\d{" +
    MIN_LEN_ACCT +
    "," +
    MAX_LEN_ACCT +
    "})";

  var instArr = getInstArrRegex();

  var acctFirstParsingRegex = new RegExp(
    acctFirstBasicStr + instArr + ")",
    "gi"
  );
  var acctLastParsingRegex = new RegExp("(" + instArr + acctLastBasicStr, "gi");

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
  // unnecessaryRegex 적용 전에 금액 먼저 찾기
  var txAmt = getWonFromTxt(txt) || "";
  // 숫자, 한글, 영어를 제외한 문자 제거
  txt = txt.replace(unnecessaryRegex, "");

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
    var dis = candidate[2].length;
    result.push({ instName, instAccount, txAmt, dis });
  }


  result.sort(function (a, b) {
    return a.dis - b.dis;
  }); // 계좌번호와 금융기관명 사이가 가까운 순으로 정렬
  
  result = result.slice(0, MAX_INST_CNT); // 이체정보 최대 개수 제한

  if(result.length === 0) {
    var matched = txt.match(/\d{7,15}/g);
    matched && result.push({ instCode: "", instAccount: matched[0], txAmt: "" });
  } 

  var resultCode = "00"; // 이체 정보가 0개일 때
  if (result.length === 1) {
    resultCode = "01"; // 이체 정보가 1개일 때
  } else if (result.length >= 2) {
    resultCode = "02"; // 이체 정보가 2개 이상일 때
  }

  return {
    resultCode,
    candidates: result
  };
}

// 함수명 변경하기 전에 호환성을 위해
function getRegResult(txt) {
  return getParsedAcctFromTxt(txt);
}

module.exports = {
  getRegResult,
}