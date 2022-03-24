import INST_INFO from "./institute";
import { wonRegex, accountRegex } from "./regex";

/**
 * 금융기관명들의 정규표현식 문자열을 반환하는 함수
 *
 * @returns {RegExp} 케이|K뱅크|국민 ...
 */

function getInstArrRegex() {
  var regText = "";

  for (var key in INST_INFO) {
    regText += key + "|";
  }

  return new RegExp(regText.substring(0, regText.length - 1), "g");
}

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
  // 공백없애기 전에 금액으로 추정되는 문자열 찾기
  const amountCandidates = txt.matchAll(wonRegex);

  const amounts = [];

  for (const amount of amountCandidates) {
    if (checkIsAmount(amount[0])) {
      amounts.push(calculateHanguelAmount(amount));
    }

    const regex = new RegExp(amount[0]);
    txt = txt.replace(regex, "");
  }

  console.log("amounts", amounts);

  const accountCandidates = txt.matchAll(accountRegex);

  const accounts = [];
  for (const account of accountCandidates) {
    const temp = transformAccount(account[0]);
    accounts.push([temp, account.index]);
  }

  console.log("accounts", accounts);
  // 1차원 적으로 계좌번호 길이가 핸드폰 번호 길이보다 길다고 생각해서 내림차순 정렬
  accounts.sort((a, b) => b[0].length - a[0].length);

  const instituteCandidates = txt.matchAll(getInstArrRegex());

  const insts = [];
  for (const inst of instituteCandidates) {
    insts.push([inst[0], inst.index]);
  }

  console.log("insts", insts);

  const candidates = [];
  for (const [acct, acctIdx] of accounts) {
    let temp = {};
    temp.acct = acct;
    temp.acctIdx = acctIdx;
    temp.dis = Number.MAX_SAFE_INTEGER;

    for (const [inst, instIdx] of insts) {
      let tempDis;
      if (temp.acctIdx > instIdx) {
        tempDis = temp.acctIdx - instIdx;
      } else {
        tempDis = instIdx - (temp.acctIdx + temp.acct.length);
      }

      if (tempDis < temp.dis) {
        temp.dis = Math.abs(temp.acctIdx - instIdx);
        temp.inst = inst;
      }
    }

    candidates.push({
      txAmt: amounts[0] || "",
      instCode: INST_INFO[temp.inst] || "",
      instAccount: temp.acct || ""
    });
  }

  console.log("candidates", candidates);

  let resultCode = "00";
  if (candidates.length === 1) {
    resultCode = "01";
  } else if (candidates.length >= 2) {
    resultCode = "02";
  }

  return {
    resultCode,
    candidates
  };
}

/**
 * 금액 문자열을 가지고 숫자만 가지는 원으로 바꿔주는 함수
 *
 * @param {RegExpMatchArray} amountInfo
 * @returns {string} 숫자만 가지는 문자열
 */

function calculateHanguelAmount(amountInfo) {
  const [amount, unit] = amountInfo;

  let number;
  let result;

  if (unit) {
    number = amount.slice(0, amount.length - 2);
    if (unit === "십") {
      result = number * 10;
    } else if (unit === "백") {
      result = number * 100;
    } else if (unit === "천") {
      result = number * 1000;
    } else if (unit === "만") {
      result = number * 10000;
    }
  } else {
    result = amount.slice(0, amount.length - 1);
  }

  return result.toString();
}

function checkIsAmount(amount) {
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

function transformAccount(acct) {
  const result = acct.replace(/[\s-]/g, "");
  return result;
}

// 함수명 변경하기 전에 호환성을 위해
export function getRegResult(txt) {
  return getParsedAcctFromTxt(txt);
}

getRegResult("신한 1400원");

// getRegResult("기업은행 1234-1234 장준혁 10원");
// getRegResult("국민 ㄴㄴ 국민은행 1234-1234-1234 장준혁 300백원");
// getRegResult(
//   "[모바일 청첩장] 장소: 더케이호텔 블루밍홀(국민은행 사거리 인근) 신랑 측 : 1002447940859(KB증권) 신부 측 : 33312341234(카카오뱅크)"
// );

// getRegResult("1234 1234 1234 3000원");
// getRegResult("기업은행 1234-1234 장준혁 10원");
// getRegResult("기업은행 1234-1234 장준혁 10원");
