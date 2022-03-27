import { getRegResult } from "../clipboard";

describe("이체정보 파싱 함수 테스트", () => {
  describe("이체 정보가 하나일 때", () => {
    it("계좌번호 - 금융기관 순서", () => {
      const result = getRegResult("1234-1234-1234 케이뱅크 장준혁 3000원");
      expect(result).toEqual({
        resultCode: "01",
        candidates: [
          { instCode: "089", instAccount: "123412341234", txAmt: "3000" }
        ]
      });
    });

    it("금융기관 - 계좌번호 순서", () => {
      const result = getRegResult(
        "케이뱅크 장준혁 1234-1234-1234 장준혁 5000원"
      );
      expect(result).toEqual({
        resultCode: "01",
        candidates: [
          { instCode: "089", instAccount: "123412341234", txAmt: "5000" }
        ]
      });
    });

    it("금융기관명 페이크1", () => {
      const result = getRegResult("국민의당 김케이 12341234123(우리)");
      expect(result).toEqual({
        resultCode: "01",
        candidates: [{ instCode: "020", instAccount: "12341234123", txAmt: "" }]
      });
    });



    it("예금주명에 금융기관명 비슷한 것이 들어가 있을 때 - 1", () => {
      const result = getRegResult("농협 123412341234 광주청소년수련원");

      expect(result).toEqual({
        resultCode: "01",
        candidates: [
          { instCode: "011", instAccount: "123412341234", txAmt: "" }
        ]
      });
    });

    it("예금주명에 금융기관명 비슷한 것이 들어가 있을 때 - 2", () => {
      const result = getRegResult("신한은행 정제일 1002447940859");

      expect(result).toEqual({
        resultCode: "01",
        candidates: [
          { instCode: "088", instAccount: "1002447940859", txAmt: "" }
        ]
      });
    });

    it("금액이 1000만원 이상일 때", () => {
      const result = getRegResult("신한은행 장준혁 1002447940859 2000만원");

      expect(result).toEqual({
        resultCode: "01",
        candidates: [
          { instCode: "088", instAccount: "1002447940859", txAmt: "" }
        ]
      });
    });
  });

  describe("이체 정보가 두 개 이상일 때", () => {
    it("지역명과 전화번호가 있을 경우(이체 정보와 비슷할 때)", () => {
      const result = getRegResult(
        "장지 : 부산 장례식장(소재지: 해운대 국민은행 옆, 051-8282-4444) / 마음을 전할 곳 : 하나은행 100-1234-5678"
      );
      expect(result).toEqual({
        resultCode: "02",
        candidates: [
          { instCode: "004", instAccount: "05182824444", txAmt: "" },
          { instCode: "081", instAccount: "10012345678", txAmt: "" }
        ]
      });
    });

    it("모바일 청첩장", () => {
      const result = getRegResult(
        "[모바일 청첩장] 장소: 더케이호텔 블루밍홀(국민은행 사거리 인근) 신랑 측 : 1002447940859(KB증권) 신부 측 : 33312341234(카카오뱅크)"
      );
      expect(result).toEqual({
        resultCode: "02",
        candidates: [
          { instCode: "218", instAccount: "1002447940859", txAmt: "" },
          { instCode: "090", instAccount: "33312341234", txAmt: "" }
        ]
      });
    });

    it("지로 납부(날짜 포함)", () => {
      const txt = `미납 상세조회
      납부: http://m.excard.co.kr
      가상계좌 납부(납부기한 2018-06-05):
      -농협 79001-95221-2713
      -국민 84249-97831-6181
      -하나 83491-06897-5372
      영업소/휴게소(안내소, 무인수납기), 홈페이지(www.excard.co.kr) 납부가능`;

      const result = getRegResult(txt);

      expect(result).toEqual({
        resultCode: "02",
        candidates: [
          { instCode: "011", instAccount: "79001952212713", txAmt: "" },
          { instCode: "004", instAccount: "84249978316181", txAmt: "" },
          { instCode: "081", instAccount: "83491068975372", txAmt: "" },
          { instCode: "011", instAccount: "20180605", txAmt: "" }
        ]
      });
    });

    it("경매 문자", () => {
      const txt = `경매기간 : 2021 년 2 월23  일~  2월  23일  23시 까지 (경매종료시 경매종료를 해주세요)
      경매품목 :난
      판매자실명 :김민호
      판매자주소 :전남
      판매자전화 :010 3899 9109
      가     격 : 경매시작 1천원 (상승가는 자율적이며,화폐 단위는 천원 또는 만원입니다)
      예 금 주 :김민호
      계좌번호 :새금 9002 1512 8355 1
      택 배 비 : 착불(ㅇ) 선불()")`;

      const result = getRegResult(txt);

      expect(result).toEqual({
        resultCode: "02",
        candidates: [
          { instCode: "045", instAccount: "9002151283551", txAmt: "1000" },
          { instCode: "045", instAccount: "01038999109", txAmt: "1000" }
        ]
      });
    });
  });
});
