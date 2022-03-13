const { expect } = require('chai');
const { getRegResult } = require('../clipboard');

describe('이체정보 파싱 함수 테스트', () => {

  describe('이체 정보가 하나일 때', () => {

    it('계좌번호 - 금융기관 순서', () => {
      const result = getRegResult('1234-1234-1234 케이뱅크 장준혁 3000원');
      expect(result).to.deep.equal({
        resultCode: '01',
        candidates: [{ instCode: '089', instAccount: '123412341234', txAmt: '3000' }],
      });
    });

    it('금융기관 - 계좌번호 순서', () => {
      const result = getRegResult('케이뱅크 장준혁 1234-1234-1234 장준혁 5000원');
      expect(result).to.deep.equal({
        resultCode: '01',
        candidates: [{ instCode: '089', instAccount: '123412341234', txAmt: '5000' }],
      });
    });
  });

  describe('이체 정보가 두 개 이상일 때', () => {

    it("지역명과 전화번호가 있을 경우(이체 정보와 비슷할 때)", () => {
      const result = getRegResult(
        '장지 : 부산 장례식장(소재지: 해운대 국민은행 옆, 051-8282-4444) / 마음을 전할 곳 : 하나은행 100-1234-5678'
      );
      expect(result).to.deep.equal({
        resultCode: '02',
        candidates: [
          { instCode: '004', instAccount: '05182824444', txAmt: '' },
          { instCode: '081', instAccount: '10012345678', txAmt: '' },
        ],
      });
    });

    it("지역명과 전화번호가 있을 경우(이체 정보와 비슷할 때)", () => {
        const result = getRegResult(
          '장지 : 부산 장례식장(소재지: 해운대 국민은행 옆, 051-8282-4444) / 마음을 전할 곳 : 하나은행 100-1234-5678'
        );
        expect(result).to.deep.equal({
          resultCode: '02',
          candidates: [
            { instCode: '004', instAccount: '05182824444', txAmt: '' },
            { instCode: '081', instAccount: '10012345678', txAmt: '' },
          ],
        });
      });
  });
});
