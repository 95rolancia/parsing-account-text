# 요구사항
텍스트에서 금융기관, 계좌번호, 금액 찾아내서 반환하는 함수 만들기.

# 기존 소스 코드 분석
1. 금융기관명에 첫 번째로 매칭되는 값 추출
2. 금액에 첫 번째로 매칭되는 값 추출
3. 계좌번호에 첫 번째로 매칭되는 값 추출
4. 추출된 세 개의 값을 객체로 반환

# 특이 케이스
1. 텍스트에 지역명이 있을 경우 금융기관으로 인식(금융기관 이름에 지역명이 들어간 경우) 
    - ex) "장지 : 부산 장례식장 / 마음을 전할 곳 : 하나은행 100-1234-5678
    - 기존 소스 코드의 경우 부산 100-1234-5678 도출

2. 2개 이상의 결과가 도출될 수 있음
    - ex) "장지 : 부산 장례식장(소재지: 해운대 국민은행 옆, 051-8282-4444) / 마음을 전할 곳 : 하나은행 100-1234-5678

3. 계좌번호 양 옆에 은행이 아니라 이름이 먼저 왔을 때를 고려.
    - 하나은행 장준혁 1234-1234-1234

4. 계좌번호가 휴대폰 번호일 때
    - 기업은행 010-1234-1234
    - 계좌번호와 휴대폰 번호를 구분하면 안된다.

# 고려할 점
- 현재 앱에서 지원하는 브라우저 사양 확인(오래된 브라우저에서 지원하지 않는 문법을 사용 했을 때 이슈 방지)
  - 현재 서비스에서 사용하고 있는 문법 준수 할 것
  - safari On IOS의 경우 ios 버전을 따라간다. -> IOS 9++ 
  - https://developer.android.com/about/versions/lollipop?hl=ko   -> android 5.0 에서는 37버전 탑재

# 문제 접근
- 고려해야 할 케이스가 너무 많다.
- 보통 이체 정보는 계좌번호와 금융기관명이 인접해있다.
- 사용자에게 편의를 제공하기 위해서 계좌번호-금융기관 쌍이 2개 이상이 검색된다면 모두 다 제공하도록 진행하면 좋을 것 같음(I/F 변경)

# 문제 해결 방법

1. 하나 vs 하나은행 시 하나은행이 먼저 검색되도록 INST_INFO를 글자 길이 수로 정렬
2. XXXXX원(금액) 추출
3. 공백, ",", "-" 지우기
4. 이체 정보 전달 시 보통 금융기관 명과 계좌 번호가 붙어있는 것에 착안
    1. 계좌번호 - 금융기관명 / 추출
    2. 금융기관명 - 계좌번호 / 추출
5. txAmt(금액)은 "XXX원"이 있다면 모든 금액에 넣어주기(이체 정보 개수에 상관 없이)

# 개선 사항
- 여러 개의 이체 정보를 반환할 때 우선 순위 부여하기.

# 기록
내부망에서 js파일을 실행하는 시간이 오래 걸려서 외부망 브라우저에서 작업

String.prototype.match
> str.match(regexp)

String.prototype.matchAll
> str.matchAll(regex) (주의! g 플래그 강제) / g플래그를 설정한 match의 결과가 index, groups 프로퍼티를 가지지 못한 단점을 보완

---

JSDoc을 사용하면 TypeScript까지는 아니더라도 함수의 params, returns의 Type을 명시해줌으로써 좀 더 이해하기 쉽게 작성할 수 있다.

- 토스앱에서 계좌번호를 클릭하면 은행이름(토스뱅크)까지 복사를 해줌(케이뱅크의 경우 계좌번호만 복사) 
- 케이뱅크 앱도 계좌번호 클릭시 은행이름까지 복사해주면 좋을 것 같음

---

기존 소스 코드에서 substr은 명세서 상 deprecated 상태


# 용어
deprecated : 언젠가 제거될 예정인
