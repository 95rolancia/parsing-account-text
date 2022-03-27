import INST_INFO from "./data/institute.js";
import {
  wonRegex,
  accountRegex,
  startsWithoutKoreanSyllablesString,
  endsWithoutKoreanSyllablesString,
  unnesscaryCharRegex
} from "./regex.js";

/**
 * 금융기관명들의 정규표현식 문자열을 반환하는 함수
 *
 * @returns {RegExp} 케이|K뱅크|국민 ...
 */

function getInstArrRegex() {
  let regText = startsWithoutKoreanSyllablesString.slice();
  regText += "(";

  // let regText = "(";

  for (const inst in INST_INFO) {
    regText += inst + "|";
  }

  regText = regText.slice(0, regText.length - 1);
  regText += ")";
  // 광주청소년수련원, 국민은행옆 과 같이 금융기관명과 글자 붙어있는 것을 제외하기 위해
  regText += endsWithoutKoreanSyllablesString;

  return new RegExp(regText, "g");
}

/**
 * 금액 문자열을 가지고 숫자만 가지는 원으로 바꿔주는 함수
 *
 * @param {RegExpMatchArray} amountInfo
 * @returns {string} 숫자만 가지는 문자열
 */

function calculateKoreanAmount(amountInfo) {
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

/**
 * 금액 문자열이 올바른지 확인하는 함수
 *
 * @param {string} amount
 * @returns {boolean}
 */

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

/**
 * 계좌번호에서 '-', '공백' 삭제
 *
 * @param {string} acct
 * @returns {string}
 */

function transformAccount(acct) {
  const result = acct.replace(/[\s-]/g, "");
  return result;
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
      const koreanAmount = calculateKoreanAmount(amount);
      if(Number(koreanAmount) >= 10000000) {
        amount.push("");
      } else {
        amounts.push(koreanAmount);
      }
      
    }

    const regex = new RegExp(amount[0]);
    txt = txt.replace(regex, "");
  }

  // console.log("amounts", amounts);

  const accountCandidates = txt.matchAll(accountRegex);

  const accounts = [];
  for (const account of accountCandidates) {
    const temp = transformAccount(account[0]);
    accounts.push([temp, account.index]);
  }

  console.log("accounts", accounts);

  // 1차원 적으로 계좌번호 길이가 핸드폰 번호 길이보다 길다고 생각해서 내림차순 정렬
  accounts.sort((a, b) => b[0].length - a[0].length);

  // 공백, 자음 모음,
  // txt = txt.replace(unnesscaryCharRegex, "");

  const instituteCandidates = txt.matchAll(getInstArrRegex());

  const insts = [];
  for (const inst of instituteCandidates) {
    insts.push([inst[0], inst.index]);
  }

  console.log("insts", insts);

  const candidates = [];
  // 각 계좌번호에서 제일 가까운 금융기관명 매칭시키기
  for (const [acct, acctIdx] of accounts) {
    let temp = {};
    temp.acct = acct;
    temp.acctFrontIdx = acctIdx;
    temp.acctEndIdx = acctIdx + acct.length - 1;
    temp.dis = Number.MAX_SAFE_INTEGER;


    for (const [inst, instIdx] of insts) {
      let curDis;
      if (temp.acctFrontIdx > instIdx) {
        curDis = temp.acctFrontIdx - (instIdx + inst.length - 1);
      } else {
        curDis = instIdx - temp.acctEndIdx;
      }

      if (curDis < temp.dis) {
        temp.dis = curDis;
        temp.inst = inst;
      }
    }

    candidates.push({
      txAmt: amounts[0] || "",
      instCode: INST_INFO[temp.inst] || "",
      instAccount: temp.acct || ""
    });
  }

  // console.log("candidates", candidates);

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

// 함수명 변경하기 전에 호환성을 위해
export function getRegResult(txt) {
  return getParsedAcctFromTxt(txt);
}

console.log(getRegResult("신한은행 정제일 1002447940859 999  만원"));
// console.log(getRegResult("신한 1400원"));

// getRegResult("1234 1234 1234 3000원");
// getRegResult("기업은행 1234-1234 장준혁 10원");
// getRegResult("기업은행 1234-1234 장준혁 10원");
