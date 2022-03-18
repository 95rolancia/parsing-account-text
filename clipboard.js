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

  return new RegExp(regText.substring(0, regText.length - 1), "g");
}

/**
 * 금융기관, 계좌번호, 금액을 파싱하는 정규표현식 튜플을 반환하는 함수
 * 1. 계좌번호 - 금융기관
 * 2. 금융기관 - 계좌번호
 *
 * @returns {[RegExp, RegExp]} 케이|K뱅크|국민 ...
 */

/**
 * 텍스트로부터 이체정보에 관한 정보를 파싱하는 함수
 * @typedef {object} AcctInfo
 * @property {string} instCode
 * @property {string} instAccount
 * @property {string} txAmt
 *
 * @typedef {object} ParsedAcctInfo
 * @property {string} instCode
 * @property {string} instAccount
 * @property {string} txAmt
 *
 * @param {string} txt 클립보드에서 가져온 텍스트
 * @returns {ParsedAcctInfo} {resultCode(반환 타입), candidates: [{이체정보}, ...]}
 */

function getParsedAcctFromTxt(txt) {
  // 공백없애기 전에 금액 먼저 찾기
  const amountCandidates = txt.matchAll(/[\d,]+(십?|백?|천?|만?)원/g);

  console.log(txt);
  const amounts = [];

  for (const amount of amountCandidates) {
    if (checkAmount(amount[0])) {
      calculateHanguelAmount(amount);
      amounts.push(amount[0]);
    }

    const regex = new RegExp(amount[0]);
    txt = txt.replace(regex, "");
    console.log(txt);
  }

  // const calculatedAmounts = amounts.map((amount) => {
  //   console.log('amount', amount);
  // })

  // console.log("amounts", amounts);
  // console.log(txt);
  // // 텍스트 다듬기
  // txt = txt.replace(/\s{2,}/g, " ");
  // console.log(txt);

  // txt = txt.replace(/(\r\n|\n|\r)/g, " ");
  // console.log(txt);

  // var result = txt.match(/\d+(-\d+){1,3}|\d+(\s\d+){1,3}|\d{7,15}/g);

  // console.log("result: ", result);

  return {
    txAmt: ""
  };
}

function calculateHanguelAmount(amountInfo) {
  const [amount, unit] = amountInfo;

  let number;
  let result;

  if (unit) {
    number = amount.slice(0, amount.length - 2);
    if (unit === "십") {
    } else if (unit === "백") {
    } else if (unit === "천") {
    } else if (unit === "만") {
    }
  } else {
    result = amount.slice(0, amount.length - 1);
  }

  console.log(number, unit);

  return result;
}

function checkAmount(amount) {
  let cnt = 0;
  let result = true;

  // ,로 시작했을 때
  if (amount[0] === ",") {
    return false;
  }

  for (let i = amount.length - 2; i >= 0; i--) {
    if (!isNaN(amount[i])) {
      cnt++;
    } else if (amount[i] === "," && cnt % 3 !== 0) {
      result = false;
      break;
    } else if (amount[i] === "," && cnt === 0) {
      result = false;
      break;
    }
  }

  return result;
}

// 함수명 변경하기 전에 호환성을 위해
function getRegResult(txt) {
  return getParsedAcctFromTxt(txt);
}

getRegResult("1234원 12,12,12원 12십원");

// txt = txt.replace(/[^\da-zA-Z가-힣\s]/g, "");
// console.log(txt);
// txt = txt.replace(/\s{1,}/g, "|");
// console.log(txt)
// txt = txt.replace(/\-/g, "|");
// console.log(txt)
