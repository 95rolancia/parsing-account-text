var INST_INFO = {
    케이뱅크: "089",
    K뱅크: "098",
    펀드온라인: "",
}

var regBlankPtn = /\s|\,|\-/g;
var regMoney = /d+원/g;
var MIN_DIS_BTW_BANK_ACCT = 8;
var MIN_LEN_ACCT = 7;
var MAX_LEN_ACCT = 15;

/**
 * matchAll
 * @param {string} rx
 * @param {string} txt
 * @returns {IterableIterator<RegExpMatchArray>} object iterator
 */

function matchAll(rx, txt) {
    if(typeof "string") rx = new RegExp(rx, "g");
    rx = new RegExp(rx, "g");
    let cap = [];
    let all = [];
    while((cap = rx.exec(txt)) !== null) all.push(cap);
    return all;
}

/**
 * 금융기관이름 리스트 정규식 객체를 반환하는 함수
 * 
 * @returns {RegExp} 케이|K뱅크|국민 ...
 */

function getParsingAcctRegex() {
    var acctFirstBasicStr = 
    "(\\d{" +
    MIN_LEN_ACCT +
    "," +
    MAX_LEN_ACCT +
    "})(\\D{0," +
    MIN_DIS_BTW_BANK_ACCT +
    "}(?=\\d*))(" ;

    var acctLastBasicStr = 
    ")(\\D{0," +
    MIN_DIS_BTW_BANK_ACCT +
    "}(?=\\d*))(\\d{" +
    MIN_LEN_ACCT +
    "," +
    MAX_LEN_ACCT +
    "})";

    var regText = "";

    for(var key in INST_INFO) {
        regText += key + "|"
    }

    var acctFirstParsingRegex = new RegExp(acctFirstBasicStr + regText + ")", "gi");
    var acctLastParsingRegex = new RegExp("(" + regText + acctLastBasicStr , "gi");

    return [acctFirstParsingRegex, acctLastParsingRegex];

}

/**
 * @typedef {object} ParsedAcctInfo
 * @property {number} instCode
 * @property {number} instAccount
 * @property {number} txAmt
 * 
 * @param {string} text 클립보드에서 가져온 텍스트
 * @returns {ParsedAcctInfo} {instCode(금융기관 코드), instAccount(계좌번호), txAmt(금액)}
 */

function getParsedAcctFromTxt(Text) {
    text = text.replace(regBlankPtn, "");
    var parsingAcctRegex = getParsingAcctRegex();
    
    var parsingAcctFirstRegex = parsingAcctRegex[0];
    var parsingAcctLastRegex = parsingAcctRegex[1];

    var candidates = [];

    var acctFirstResult = matchAll(parsingAcctFirstRegex, text);
    var acct
}