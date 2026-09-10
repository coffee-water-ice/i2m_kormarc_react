/**
 * 자동 생성 파일 — 직접 고치지 말 것.
 * scripts/generate-marc-schema.mjs가 scripts/marc-source/Tag.utf8.txt +
 * Indicator.utf8.txt(국립중앙도서관 KORMARC 지시기호·식별기호 정의)로부터 생성했다.
 * 원본이 바뀌면 "node scripts/generate-marc-schema.mjs"로 재생성한다.
 * (생성일: 2026-09-10)
 */

export interface MarcSubfieldMeta {
  code: string
  name: string
  repeatable: boolean
}

export interface MarcIndicatorMeta {
  /** 지시기호 이름(예: "발행사항의 순차"). */
  name: string
  /** 값 문자('0'-'9' 또는 공백을 뜻하는 'b') → 의미. */
  values: Record<string, string>
}

export interface MarcTagMeta {
  tag: string
  name: string
  repeatable: boolean
  mandatory: 1 | 2 | 3
  subfields: MarcSubfieldMeta[]
  indicators: Partial<Record<1 | 2, MarcIndicatorMeta>>
}

export const MARC_SCHEMA: Record<string, MarcTagMeta> = {
  "100": {
    "tag": "100",
    "name": "기본표목 - 개인명",
    "repeatable": false,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "개인명(성과 이름)",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "이름(名)에 포함되어 세계(世系)를 칭하는 숫자",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "이름과 관련 정보 (직위, 칭호 및 기타 명칭, 역조(歷朝), 국명(國名), 한국 및 중국의 세계(世系))",
        "repeatable": true
      },
      {
        "code": "d",
        "name": "생몰년",
        "repeatable": false
      },
      {
        "code": "e",
        "name": "역할어",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "저작 연도",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "기타 정보",
        "repeatable": false
      },
      {
        "code": "j",
        "name": "속성 한정어",
        "repeatable": true
      },
      {
        "code": "k",
        "name": "형식부표목",
        "repeatable": true
      },
      {
        "code": "l",
        "name": "저작의 언어",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "책$권차, 편차",
        "repeatable": true
      },
      {
        "code": "p",
        "name": "저작의 편제",
        "repeatable": true
      },
      {
        "code": "q",
        "name": "이름의 완전형",
        "repeatable": false
      },
      {
        "code": "t",
        "name": "저작의 표제",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "소속",
        "repeatable": false
      },
      {
        "code": "4",
        "name": "역할어 부호",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "개인명의 유형",
        "values": {
          "0": "성으로 시작하지 않는 이름(forename)",
          "1": "성으로 시작하는 이름(surname)",
          "3": "가계명(家系名, family name)"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "110": {
    "tag": "110",
    "name": "기본표목 - 단체명",
    "repeatable": false,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "기본요소",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "하위기관",
        "repeatable": true
      },
      {
        "code": "c",
        "name": "회의 개최지",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "회의일자나 조약체결일자",
        "repeatable": true
      },
      {
        "code": "e",
        "name": "역할어",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "저작 연도",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "기타정보",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "형식부표목",
        "repeatable": true
      },
      {
        "code": "l",
        "name": "저작의 언어",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "분과 및 부회 회의 회차",
        "repeatable": true
      },
      {
        "code": "p",
        "name": "저작의 편제",
        "repeatable": true
      },
      {
        "code": "t",
        "name": "저작의 표제",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "소속",
        "repeatable": false
      },
      {
        "code": "4",
        "name": "역할어 부호",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "111": {
    "tag": "111",
    "name": "기본표목 - 회의명",
    "repeatable": false,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "회의명",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "회의장소",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "회의일자",
        "repeatable": false
      },
      {
        "code": "e",
        "name": "하위단위",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "저작 연도",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "기타 정보",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "형식부표목",
        "repeatable": true
      },
      {
        "code": "l",
        "name": "저작의 언어",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "분과 및 부회 회의 회차",
        "repeatable": true
      },
      {
        "code": "p",
        "name": "회차표제",
        "repeatable": true
      },
      {
        "code": "t",
        "name": "저작의 표제",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "소속",
        "repeatable": false
      },
      {
        "code": "4",
        "name": "역할어 부호",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "130": {
    "tag": "130",
    "name": "기본표목 - 통일표제",
    "repeatable": false,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "통일표제",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "조약체결일자",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "저작 연도",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "기타정보",
        "repeatable": false
      },
      {
        "code": "h",
        "name": "자료유형표시",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "형식부표목",
        "repeatable": true
      },
      {
        "code": "l",
        "name": "저작의 언어",
        "repeatable": false
      },
      {
        "code": "m",
        "name": "연주수단",
        "repeatable": true
      },
      {
        "code": "n",
        "name": "권차",
        "repeatable": true
      },
      {
        "code": "o",
        "name": "편곡",
        "repeatable": false
      },
      {
        "code": "p",
        "name": "권차표제",
        "repeatable": true
      },
      {
        "code": "r",
        "name": "음악자료의 장조",
        "repeatable": false
      },
      {
        "code": "s",
        "name": "판",
        "repeatable": false
      },
      {
        "code": "t",
        "name": "저작의 표제",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "관제 및 관사 출력형태",
        "values": {
          "0": "그대로 인쇄",
          "1": "원괄호를 제외하고 인쇄"
        }
      }
    }
  },
  "210": {
    "tag": "210",
    "name": "축약표제",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "축약표제",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "부가적 식별정보",
        "repeatable": false
      },
      {
        "code": "2",
        "name": "축약표제 정보원",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "표제의 부출",
        "values": {
          "0": "표제를 부출하지 않음",
          "1": "표제를 부출함"
        }
      },
      "2": {
        "name": "표제의 유형",
        "values": {
          "0": "기타 축약표제",
          "b": "축약등록표제"
        }
      }
    }
  },
  "222": {
    "tag": "222",
    "name": "등록표제",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "등록표제",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "부가적 식별정보",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "관제 및 관사 출력형태",
        "values": {
          "0": "그대로 인쇄",
          "1": "원괄호를 제외하고 인쇄"
        }
      }
    }
  },
  "240": {
    "tag": "240",
    "name": "통일표제",
    "repeatable": false,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "통일표제",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "조약체결일자",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "저작 연도",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "기타 정보",
        "repeatable": false
      },
      {
        "code": "h",
        "name": "자료유형표시",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "형식부표목",
        "repeatable": true
      },
      {
        "code": "l",
        "name": "저작의 언어",
        "repeatable": false
      },
      {
        "code": "m",
        "name": "연주수단",
        "repeatable": true
      },
      {
        "code": "n",
        "name": "권차",
        "repeatable": true
      },
      {
        "code": "o",
        "name": "편곡",
        "repeatable": false
      },
      {
        "code": "p",
        "name": "권차표제",
        "repeatable": true
      },
      {
        "code": "r",
        "name": "음악자료의 장조",
        "repeatable": false
      },
      {
        "code": "s",
        "name": "판",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "표제의 출력",
        "values": {
          "0": "표제를 출력하지 않음",
          "1": "표제를 출력함"
        }
      },
      "2": {
        "name": "관제 및 관사 출력형태",
        "values": {
          "0": "그대로 인쇄",
          "1": "원괄호를 제외하고 인쇄"
        }
      }
    }
  },
  "242": {
    "tag": "242",
    "name": "목록작성기관에서 번역한 표제",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "표제",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "표제 관련 정보",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "책임표시",
        "repeatable": false
      },
      {
        "code": "h",
        "name": "자료유형표시",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "권차 또는 편차",
        "repeatable": true
      },
      {
        "code": "p",
        "name": "권제 또는 편제",
        "repeatable": true
      },
      {
        "code": "y",
        "name": "번역표제의 언어부호",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "표제의 부출",
        "values": {
          "0": "표제를 부출하지 않음",
          "1": "표제를 부출함",
          "2": "관제를 포함해서 표제를 부출함"
        }
      },
      "2": {
        "name": "관제 및 관사 출력형태",
        "values": {
          "0": "그대로 인쇄",
          "1": "원괄호를 제외하고 인쇄"
        }
      }
    }
  },
  "243": {
    "tag": "243",
    "name": "종합통일표제",
    "repeatable": false,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "통일표제",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "조약체결일자",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "저작 연도",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "기타 정보",
        "repeatable": false
      },
      {
        "code": "h",
        "name": "자료유형표시",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "형식부표목",
        "repeatable": true
      },
      {
        "code": "l",
        "name": "저작의 언어",
        "repeatable": false
      },
      {
        "code": "m",
        "name": "연주수단",
        "repeatable": true
      },
      {
        "code": "n",
        "name": "권차",
        "repeatable": true
      },
      {
        "code": "o",
        "name": "편곡",
        "repeatable": false
      },
      {
        "code": "p",
        "name": "권차표제",
        "repeatable": true
      },
      {
        "code": "r",
        "name": "음악자료의 장조",
        "repeatable": false
      },
      {
        "code": "s",
        "name": "판",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "표제의 출력",
        "values": {
          "0": "표제를 출력하지 않음",
          "1": "표제를 출력함"
        }
      },
      "2": {
        "name": "관제 및 관사 출력형태",
        "values": {
          "0": "그대로 인쇄",
          "1": "원괄호를 제외하고 인쇄"
        }
      }
    }
  },
  "245": {
    "tag": "245",
    "name": "표제와 책임표시사항",
    "repeatable": false,
    "mandatory": 1,
    "subfields": [
      {
        "code": "a",
        "name": "본표제",
        "repeatable": true
      },
      {
        "code": "b",
        "name": "표제 관련 정보",
        "repeatable": true
      },
      {
        "code": "d",
        "name": "첫 번째 책임표시",
        "repeatable": true
      },
      {
        "code": "e",
        "name": "두 번째 이하의 책임표시",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "수집된 자료의 전체 포괄연도(Inclusive dates)",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "수집된 자료 중 대다수 자료의 포괄연도(Bulk dates)",
        "repeatable": false
      },
      {
        "code": "h",
        "name": "자료유형표시",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "형식",
        "repeatable": true
      },
      {
        "code": "n",
        "name": "권차 또는 편차",
        "repeatable": true
      },
      {
        "code": "p",
        "name": "권제 또는 편제",
        "repeatable": true
      },
      {
        "code": "s",
        "name": "판(version)",
        "repeatable": false
      },
      {
        "code": "x",
        "name": "대등표제",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "표제의 부출",
        "values": {
          "0": "표제를 부출하지 않음",
          "1": "표제를 부출함",
          "2": "관제를 포함해서 표제를 부출함"
        }
      },
      "2": {
        "name": "관제 및 관사 출력형태",
        "values": {
          "0": "그대로 인쇄",
          "1": "원괄호를 제외하고 인쇄"
        }
      }
    }
  },
  "246": {
    "tag": "246",
    "name": "여러 형태의 표제",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "본표제/간략표제",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "표제 관련 정보",
        "repeatable": false
      },
      {
        "code": "f",
        "name": "권/연차표시",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "기타정보",
        "repeatable": false
      },
      {
        "code": "h",
        "name": "자료유형표시",
        "repeatable": false
      },
      {
        "code": "i",
        "name": "설명어구 표시",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "권차/편차",
        "repeatable": true
      },
      {
        "code": "p",
        "name": "권제/편제",
        "repeatable": true
      },
      {
        "code": "5",
        "name": "필드 적용 기관",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "주기 제어/표제부출",
        "values": {
          "0": "주기함, 표제를 부출하지 않음",
          "1": "주기함, 표제를 부출함",
          "2": "주기하지 않음, 표제를 부출하지 않음",
          "3": "주기하지 않음, 표제를 부출함"
        }
      },
      "2": {
        "name": "표출어 제어/표제유형",
        "values": {
          "0": "검색을 위한 부분표제",
          "1": "대등표제",
          "2": "식별표제",
          "3": "기타표제",
          "4": "표지표제",
          "5": "부표제지표제",
          "6": "권두표제",
          "7": "난외표제",
          "8": "책등표제",
          "9": "원표제",
          "b": "표출어를 생성하지 않음"
        }
      }
    }
  },
  "247": {
    "tag": "247",
    "name": "변경전 표제나 표제변동",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "본표제/간략표제",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "표제관련정보",
        "repeatable": false
      },
      {
        "code": "f",
        "name": "권/연차표시",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "기타정보",
        "repeatable": false
      },
      {
        "code": "h",
        "name": "자료유형표시",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "권차/편차",
        "repeatable": true
      },
      {
        "code": "p",
        "name": "권제/편제",
        "repeatable": true
      },
      {
        "code": "x",
        "name": "국제표준연속간행물번호(ISSN)",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "표제 부출",
        "values": {
          "0": "표제를 부출하지 않음",
          "1": "표제를 부출함"
        }
      },
      "2": {
        "name": "주기 제어",
        "values": {
          "0": "주기함",
          "1": "주기하지 않음"
        }
      }
    }
  },
  "250": {
    "tag": "250",
    "name": "판사항",
    "repeatable": false,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "판표시",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "해당 판의 저작자 표시 등",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "254": {
    "tag": "254",
    "name": "악보의 표현형식",
    "repeatable": false,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "악보의 표현형식",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "255": {
    "tag": "255",
    "name": "지도제작의 수치데이터",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "축척표시",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "도법표시",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "경위도표시",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "적위(赤緯)",
        "repeatable": false
      },
      {
        "code": "e",
        "name": "분점(分點)",
        "repeatable": false
      },
      {
        "code": "f",
        "name": "외계 G-원형 간좌표",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "배제 G-원형 간좌표",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "256": {
    "tag": "256",
    "name": "컴퓨터파일 특성",
    "repeatable": false,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "컴퓨터파일 특성",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "257": {
    "tag": "257",
    "name": "기록필름의 제작국명",
    "repeatable": false,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "제작국명",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "260": {
    "tag": "260",
    "name": "발행, 배포, 간사 사항",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "발행지, 배포지 등",
        "repeatable": true
      },
      {
        "code": "b",
        "name": "발행처, 배포처 등",
        "repeatable": true
      },
      {
        "code": "c",
        "name": "발행년, 배포년 등",
        "repeatable": true
      },
      {
        "code": "e",
        "name": "제작지 또는 인쇄지",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "제작처 또는 인쇄처",
        "repeatable": true
      },
      {
        "code": "g",
        "name": "제작년 또는 인쇄년",
        "repeatable": true
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "발행사항의 순차",
        "values": {
          "2": "중간발행처(Intervening publisher)",
          "3": "현행/최근 발행처(current/latest publisher)",
          "b": "적용 불가/제공되는 정보 없음/최초 발행처"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "263": {
    "tag": "263",
    "name": "발행예정일자",
    "repeatable": false,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "발행예정일자",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "270": {
    "tag": "270",
    "name": "자료관련주소",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "주소(Address)",
        "repeatable": true
      },
      {
        "code": "b",
        "name": "도시(City)",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "주 또는 도(State or province)",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "국가(Country)",
        "repeatable": false
      },
      {
        "code": "e",
        "name": "우편번호(Postal code)",
        "repeatable": false
      },
      {
        "code": "f",
        "name": "수신인 이름 앞에 사용하는 용어",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "수신인 이름",
        "repeatable": false
      },
      {
        "code": "h",
        "name": "수신인의 지위",
        "repeatable": false
      },
      {
        "code": "i",
        "name": "주소 유형",
        "repeatable": false
      },
      {
        "code": "j",
        "name": "특수 전화번호",
        "repeatable": true
      },
      {
        "code": "k",
        "name": "전화번호",
        "repeatable": true
      },
      {
        "code": "l",
        "name": "팩스번호",
        "repeatable": true
      },
      {
        "code": "m",
        "name": "전자우편주소",
        "repeatable": true
      },
      {
        "code": "n",
        "name": "TDD 또는 TTY번호(청각장애인용 전화장치)",
        "repeatable": true
      },
      {
        "code": "p",
        "name": "연락자",
        "repeatable": true
      },
      {
        "code": "q",
        "name": "연락자의 직함",
        "repeatable": true
      },
      {
        "code": "r",
        "name": "연락가능시간",
        "repeatable": true
      },
      {
        "code": "z",
        "name": "공개여부 주기",
        "repeatable": true
      },
      {
        "code": "4",
        "name": "역할어부호",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "수준",
        "values": {
          "1": "주된 주소(Primary)",
          "2": "부차적 주소(Secondary)",
          "b": "특정 수준 없음"
        }
      },
      "2": {
        "name": "주소의 유형",
        "values": {
          "0": "우편",
          "7": "식별기호 $i에 기술된 유형",
          "b": "특정 유형 없음"
        }
      }
    }
  },
  "300": {
    "tag": "300",
    "name": "형태사항",
    "repeatable": true,
    "mandatory": 1,
    "subfields": [
      {
        "code": "a",
        "name": "특정자료종별과 수량",
        "repeatable": true
      },
      {
        "code": "b",
        "name": "기타 물리적 특성",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "크기",
        "repeatable": true
      },
      {
        "code": "e",
        "name": "딸림자료",
        "repeatable": false
      },
      {
        "code": "f",
        "name": "단위의 유형",
        "repeatable": true
      },
      {
        "code": "g",
        "name": "단위의 크기",
        "repeatable": true
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "306": {
    "tag": "306",
    "name": "재생/연주시간",
    "repeatable": false,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "재생/연주시간",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "307": {
    "tag": "307",
    "name": "이용시간",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "이용시간 등",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "부가정보",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "표출어 제어",
        "values": {
          "8": "표출어를 생성하지 않음",
          "b": "이용시간"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "310": {
    "tag": "310",
    "name": "현재 간행빈도",
    "repeatable": false,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "현재 간행빈도",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "현재 간행빈도 시작 연/월",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "321": {
    "tag": "321",
    "name": "이전 간행빈도",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "이전 간행빈도",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "이전 간행빈도 시행 연$월",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "340": {
    "tag": "340",
    "name": "물리적 매체 유형",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "자료의 기본재질과 외형",
        "repeatable": true
      },
      {
        "code": "b",
        "name": "크기",
        "repeatable": true
      },
      {
        "code": "c",
        "name": "표면 재질",
        "repeatable": true
      },
      {
        "code": "d",
        "name": "정보수록 기법",
        "repeatable": true
      },
      {
        "code": "e",
        "name": "지지(틀) 재료",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "회전율/축소율",
        "repeatable": true
      },
      {
        "code": "h",
        "name": "매체내의 위치",
        "repeatable": true
      },
      {
        "code": "i",
        "name": "매체의 기술사양",
        "repeatable": true
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "342": {
    "tag": "342",
    "name": "지리공간참조정보",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "이름(Name)",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "좌표나 거리의 단위(Coordinate or distance units)",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "경도 해상도(Latitude resolution)",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "위도 해상도(Longitute resolution)",
        "repeatable": false
      },
      {
        "code": "e",
        "name": "표준 위선 또는 사선 위도(Standard parallel or oblique line latitude)",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "사선 경도(Oblique line longitude)",
        "repeatable": true
      },
      {
        "code": "g",
        "name": "중심축 경도 또는 투영 중심의 경도(Logitude of central meridian or projection center)",
        "repeatable": false
      },
      {
        "code": "h",
        "name": "투영 기점의 위도 또는 투영 중심의 위도(Latitude of central meridian or projection center)",
        "repeatable": false
      },
      {
        "code": "i",
        "name": "x좌표 동위 이동 추가 값(False easting)",
        "repeatable": false
      },
      {
        "code": "j",
        "name": "y좌표 북위 이동 추가 값(False northing)",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "축척계수(Scale factor)",
        "repeatable": false
      },
      {
        "code": "l",
        "name": "관측 눈 높이(Height of perspective point above surface)",
        "repeatable": false
      },
      {
        "code": "m",
        "name": "방위각(Azimuthal angle)",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "방위각 측정 점 경도 또는 극에서부터의 직선 수직 경도",
        "repeatable": false
      },
      {
        "code": "o",
        "name": "지구관측 위성번호와 궤도번호(Landsat number and path number)",
        "repeatable": false
      },
      {
        "code": "p",
        "name": "존 식별정보(Zone identifier)",
        "repeatable": false
      },
      {
        "code": "q",
        "name": "지구 타원체명(Ellipsoid name)",
        "repeatable": false
      },
      {
        "code": "r",
        "name": "반장축(Semi-major axis)",
        "repeatable": false
      },
      {
        "code": "s",
        "name": "역 편평율(Denominator of flattening ratio)",
        "repeatable": false
      },
      {
        "code": "t",
        "name": "수직거리 해상도(Vertical resolution)",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "수직거리 부호화 방법(Vertical encoding method)",
        "repeatable": false
      },
      {
        "code": "v",
        "name": "공간 평면, 공간 또는 다른 투영법이나 격자시스템 기술(Local planar, local, or other projection or grid description)",
        "repeatable": false
      },
      {
        "code": "w",
        "name": "공간 평면 또는 공간 지리 참조 정보(Local planar or local georeference information)",
        "repeatable": false
      },
      {
        "code": "2",
        "name": "사용된 참조 방법(Reference method used)",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "공간 참조 차원",
        "values": {
          "0": "수평적 좌표 시스템",
          "1": "수직적 좌표 시스템"
        }
      },
      "2": {
        "name": "공간 참조 방법",
        "values": {
          "0": "지리적 좌표 시스템(Geographic)",
          "1": "지도 투영법(Map projection)",
          "2": "격자 좌표 시스템(Grid coordinate system)",
          "3": "공간 평면(Local Planar)",
          "4": "공간(Local)",
          "5": "측지 모형(Geodetic Model)",
          "6": "표고(Altitude)",
          "7": "식별기호 ?2에서 정의한 방법",
          "8": "깊이(Depth)"
        }
      }
    }
  },
  "343": {
    "tag": "343",
    "name": "평면 좌표 정보",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "평면좌표 부호화 방법(Planar coordinate encoding method)",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "평면 거리 단위(Planar distance units)",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "가로 좌표 해상도(Abscissa resolution)",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "세로 좌표 해상도(Ordinate resolution)",
        "repeatable": false
      },
      {
        "code": "e",
        "name": "거리 해상도(Distance resolution)",
        "repeatable": false
      },
      {
        "code": "f",
        "name": "방위각 해상도(Bearing resolution)",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "방위각 단위(Bearing units)",
        "repeatable": false
      },
      {
        "code": "h",
        "name": "방위각 참조 방향(Bearing reference direction)",
        "repeatable": false
      },
      {
        "code": "i",
        "name": "방위각 참조 축(Bearing reference meridian)",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호(Field link and sequence number)",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "351": {
    "tag": "351",
    "name": "자료의 구조와 배열",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "파일구조",
        "repeatable": true
      },
      {
        "code": "b",
        "name": "배열",
        "repeatable": true
      },
      {
        "code": "c",
        "name": "계층수준",
        "repeatable": false
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "352": {
    "tag": "352",
    "name": "디지털 그래픽 표현",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "직접 참조 방법(Direct reference method)",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "객체의 유형(Object type)",
        "repeatable": true
      },
      {
        "code": "c",
        "name": "객체 유형의 총수(Object count)",
        "repeatable": true
      },
      {
        "code": "d",
        "name": "열 수(Raw count)",
        "repeatable": false
      },
      {
        "code": "e",
        "name": "행 수(Column count)",
        "repeatable": false
      },
      {
        "code": "f",
        "name": "수직선 수(Vertical count)",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "위상관계 수준(VPF topology level)",
        "repeatable": false
      },
      {
        "code": "i",
        "name": "간접 참조 수단(Indirect reference description)",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "355": {
    "tag": "355",
    "name": "보안분류 통제",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "보안등급",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "취급설명",
        "repeatable": true
      },
      {
        "code": "c",
        "name": "외부배포정보",
        "repeatable": true
      },
      {
        "code": "d",
        "name": "하위로의 등급조정 정보",
        "repeatable": false
      },
      {
        "code": "e",
        "name": "분류체계",
        "repeatable": false
      },
      {
        "code": "f",
        "name": "최초의 보안분류 국가",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "보안등급 강등 일자",
        "repeatable": false
      },
      {
        "code": "h",
        "name": "보안등급 해제일자",
        "repeatable": false
      },
      {
        "code": "j",
        "name": "권한기관",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "통제요소",
        "values": {
          "0": "문서(Document)",
          "1": "표제",
          "2": "초록",
          "3": "내용주기",
          "4": "저작자",
          "5": "레코드",
          "8": "기타요소"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "357": {
    "tag": "357",
    "name": "원작자의 배포 제어",
    "repeatable": false,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "원작자 제어용어",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "원작 제작기관",
        "repeatable": true
      },
      {
        "code": "c",
        "name": "자료접수권한자(Authorized recipients of material)",
        "repeatable": true
      },
      {
        "code": "g",
        "name": "기타 제한 사항(Other restrictions)",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "362": {
    "tag": "362",
    "name": "권？연차, 연월차 사항",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "권/연차 또는 발행년 표시",
        "repeatable": false
      },
      {
        "code": "z",
        "name": "확인자료명",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "권/연차의 형식",
        "values": {
          "0": "확정형",
          "1": "미확정형"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "440": {
    "tag": "440",
    "name": "총서사항/부출표목 - 표제",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "총서표제",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "총서의 편(part)차",
        "repeatable": true
      },
      {
        "code": "p",
        "name": "총서의 편(part)제",
        "repeatable": true
      },
      {
        "code": "s",
        "name": "국제표준연속간행물번호(ISSN)",
        "repeatable": false
      },
      {
        "code": "v",
        "name": "총서번호",
        "repeatable": false
      },
      {
        "code": "x",
        "name": "대등총서표제",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "부출 형식",
        "values": {
          "0": "총서표제를 부출함",
          "1": "관제를 포함해서 총서표제를 부출함"
        }
      },
      "2": {
        "name": "관제 및 관사 출력형태",
        "values": {
          "0": "그대로 인쇄",
          "1": "원괄호를 제외하고 인쇄"
        }
      }
    }
  },
  "490": {
    "tag": "490",
    "name": "총서사항/부출되지 않거나 다르게 부출되는 총서표제",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "총서사항",
        "repeatable": true
      },
      {
        "code": "s",
        "name": "국제표준연속간행물번호(ISSN)",
        "repeatable": false
      },
      {
        "code": "v",
        "name": "총서번호",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "총서 부출 식별",
        "values": {
          "0": "부출되지 않는 총서표제",
          "1": "다르게 부출되는 총서표제"
        }
      },
      "2": {
        "name": "관제 및 관사 출력형태",
        "values": {
          "0": "그대로 인쇄",
          "1": "원괄호를 제외하고 인쇄"
        }
      }
    }
  },
  "500": {
    "tag": "500",
    "name": "일반주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "일반주기",
        "repeatable": false
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "5",
        "name": "필드 적용 기관",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "501": {
    "tag": "501",
    "name": "합철주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "합철주기",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "표제",
        "repeatable": true
      },
      {
        "code": "d",
        "name": "첫 번째 책임표시",
        "repeatable": true
      },
      {
        "code": "e",
        "name": "두 번째 이하 책임표시",
        "repeatable": true
      },
      {
        "code": "g",
        "name": "기타 정보",
        "repeatable": true
      },
      {
        "code": "n",
        "name": "판사항",
        "repeatable": true
      },
      {
        "code": "p",
        "name": "발행사항",
        "repeatable": true
      },
      {
        "code": "q",
        "name": "형태사항",
        "repeatable": true
      },
      {
        "code": "t",
        "name": "총서사항",
        "repeatable": true
      },
      {
        "code": "x",
        "name": "대등표제",
        "repeatable": true
      },
      {
        "code": "5",
        "name": "필드 적용 기관",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "502": {
    "tag": "502",
    "name": "학위논문주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "학위논문의 종류",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "학위수여기관",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "학과 및 전공",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "학위수여연도",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "학위논문의 종류",
        "values": {
          "0": "석사학위논문",
          "1": "박사학위논문"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "504": {
    "tag": "504",
    "name": "서지 등 주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "서지 등 주기",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "참고문헌의 수",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "505": {
    "tag": "505",
    "name": "내용주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "형식화된 내용주기",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "첫 번째 책임표시",
        "repeatable": true
      },
      {
        "code": "e",
        "name": "두 번째 이하 책임표시",
        "repeatable": true
      },
      {
        "code": "n",
        "name": "권차",
        "repeatable": true
      },
      {
        "code": "t",
        "name": "표제",
        "repeatable": true
      },
      {
        "code": "g",
        "name": "기타 정보",
        "repeatable": true
      },
      {
        "code": "u",
        "name": "URI (Uniform Resource Identifier)",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "표출어 제어",
        "values": {
          "0": "완전한 내용주기",
          "1": "불완전한 내용주기",
          "2": "부분 내용주기",
          "8": "표출어를 생성하지 않음"
        }
      },
      "2": {
        "name": "내용표시의 수준",
        "values": {
          "0": "확장형",
          "b": "기본형"
        }
      }
    }
  },
  "506": {
    "tag": "506",
    "name": "이용제한주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "이용제한사항",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "법적 제한",
        "repeatable": true
      },
      {
        "code": "c",
        "name": "물리적 접근에 필요한 규정",
        "repeatable": true
      },
      {
        "code": "d",
        "name": "이용권한이 있는 이용자",
        "repeatable": true
      },
      {
        "code": "e",
        "name": "근거",
        "repeatable": true
      },
      {
        "code": "u",
        "name": "URI(Uniform Resource Identifier)",
        "repeatable": true
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "5",
        "name": "필드 적용 기관",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "507": {
    "tag": "507",
    "name": "그래픽자료의 축척주기",
    "repeatable": false,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "대표적 비율 축척주기",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "기타 축척주기",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "508": {
    "tag": "508",
    "name": "제작진주기",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "제작진주기",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "510": {
    "tag": "510",
    "name": "인용/참고 주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "해제지, 색인지, 초록지 등의 정보원명",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "정보원의 수록기간",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "정보원 내의 위치",
        "repeatable": false
      },
      {
        "code": "x",
        "name": "국제표준연속간행물번호(ISSN)",
        "repeatable": false
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "수록범위/위치",
        "values": {
          "0": "수록범위를 알 수 없는 자료",
          "1": "완전하게 수록된 자료",
          "2": "선택적으로 수록된 자료",
          "3": "정보원의 위치가 표시되지 않음(Location in source not given)",
          "4": "정보원의 위치가 표시됨(Location in source given)",
          "8": "표출어를 생성하지 않음"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "511": {
    "tag": "511",
    "name": "연주자와 배역진 주기",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "연주자와 배역진 주기",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "표출어 제어",
        "values": {
          "1": "배역",
          "8": "표출어를 생성하지 않음"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "513": {
    "tag": "513",
    "name": "보고서 유형과 해당기간 주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "보고서 유형",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "해당기간",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "514": {
    "tag": "514",
    "name": "지리공간데이터 품질 주기",
    "repeatable": false,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "속성정확도 보고(Attribute accuracy report)",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "속성정확도 값(Attribute accuracy value)",
        "repeatable": true
      },
      {
        "code": "c",
        "name": "속성정확도 설명(Attribute accuracy explanation)",
        "repeatable": true
      },
      {
        "code": "d",
        "name": "논리적 일관성 보고(Logical consistency report)",
        "repeatable": false
      },
      {
        "code": "e",
        "name": "완전성 보고(completeness)",
        "repeatable": false
      },
      {
        "code": "f",
        "name": "수평 위치정확도 보고(Horizontal Position accuracy report)",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "수평 위치정확도 값(Horizontal Position accuracy value)",
        "repeatable": true
      },
      {
        "code": "h",
        "name": "수평 위치정확도 설명(Horizontal Position accuracy explanation)",
        "repeatable": true
      },
      {
        "code": "i",
        "name": "수직 위치정확도 보고(Vertical Position accuracy report)",
        "repeatable": false
      },
      {
        "code": "j",
        "name": "수직 위치정확도 값(Vertical Position accuracy value)",
        "repeatable": true
      },
      {
        "code": "k",
        "name": "수직 위치정확도 설명(Vertical Position accuracy explanation)",
        "repeatable": true
      },
      {
        "code": "m",
        "name": "구름 비율(cloud cover)",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "URI (Uniform Resource Identifier)",
        "repeatable": true
      },
      {
        "code": "z",
        "name": "디스플레이 주기",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "515": {
    "tag": "515",
    "name": "특수한 권차표시 주기",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "특수한 권차표시주기",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "516": {
    "tag": "516",
    "name": "컴퓨터파일과 데이터유형 주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "컴퓨터파일과 데이터유형",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "표출어 제어",
        "values": {
          "8": "표출어를 생성하지 않음",
          "b": "파일유형"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "518": {
    "tag": "518",
    "name": "촬영/녹음 일시와 장소 주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "촬영/녹음 일시와 장소",
        "repeatable": false
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "520": {
    "tag": "520",
    "name": "요약 등 주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "요약 등 주기",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "추가요약정보",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "URI (Uniform Resource Identifier)",
        "repeatable": true
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "표출어 제어",
        "values": {
          "0": "주제",
          "1": "평론",
          "2": "범위와 내용",
          "3": "초록",
          "4": "해제",
          "8": "표출어를 생성하지 않음",
          "b": "요약"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "521": {
    "tag": "521",
    "name": "이용대상자 주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "이용대상자",
        "repeatable": true
      },
      {
        "code": "b",
        "name": "정보원",
        "repeatable": false
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "표출어 제어",
        "values": {
          "0": "독서 수준",
          "1": "대상 연령",
          "2": "대상 학년",
          "3": "특수 이용대상",
          "4": "동기유발 수준",
          "8": "표출어를 생성하지 않음",
          "b": "이용대상자"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "522": {
    "tag": "522",
    "name": "지리적 범위 주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "지리적 범위 주기",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "표출어 제어",
        "values": {
          "8": "표출어를 생성하지 않음",
          "b": "지리적 범위"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "524": {
    "tag": "524",
    "name": "인용한 자료에 관한 주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "인용주기",
        "repeatable": false
      },
      {
        "code": "2",
        "name": "사용된 스키마의 정보원",
        "repeatable": false
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "표출어 제어",
        "values": {
          "8": "표출어를 생성하지 않음",
          "b": "인용"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "525": {
    "tag": "525",
    "name": "부록주기",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "부록주기",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "526": {
    "tag": "526",
    "name": "학습프로그램 주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "프로그램명",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "학습 수준",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "독서 수준",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "적립 포인트 값",
        "repeatable": false
      },
      {
        "code": "i",
        "name": "표출어 표시",
        "repeatable": false
      },
      {
        "code": "x",
        "name": "비공개 주기",
        "repeatable": true
      },
      {
        "code": "z",
        "name": "공개 주기",
        "repeatable": true
      },
      {
        "code": "5",
        "name": "필드 적용기관",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련 번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "표출어 제어",
        "values": {
          "0": "독서프로그램",
          "8": "표출어를 생성하지 않음"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "530": {
    "tag": "530",
    "name": "이용가능한 다른 형태자료 주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "이용가능한 다른 형태자료",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "이용가능 정보원",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "이용가능 조건",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "주문번호",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "URI (Uniform Resource Identifier)",
        "repeatable": true
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련 번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "533": {
    "tag": "533",
    "name": "복제주기",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "복제형식",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "복제장소",
        "repeatable": true
      },
      {
        "code": "c",
        "name": "복제기관",
        "repeatable": true
      },
      {
        "code": "d",
        "name": "복제일자",
        "repeatable": false
      },
      {
        "code": "e",
        "name": "복제 형태사항",
        "repeatable": false
      },
      {
        "code": "f",
        "name": "복제 총서사항",
        "repeatable": true
      },
      {
        "code": "m",
        "name": "복제한 원본의 발행기간",
        "repeatable": true
      },
      {
        "code": "n",
        "name": "복제에 관한 주기",
        "repeatable": true
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "7",
        "name": "복제물의 고정길이 데이터 요소",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "534": {
    "tag": "534",
    "name": "원본주기",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "원본의 기본표목",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "원본 판사항",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "원본 발행사항",
        "repeatable": false
      },
      {
        "code": "e",
        "name": "원본 형태사항",
        "repeatable": false
      },
      {
        "code": "f",
        "name": "원본 총서사항",
        "repeatable": true
      },
      {
        "code": "k",
        "name": "원본 등록표제",
        "repeatable": true
      },
      {
        "code": "l",
        "name": "원본 소장처",
        "repeatable": false
      },
      {
        "code": "m",
        "name": "원본의 특수한 정보표시",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "원본관련 주기",
        "repeatable": true
      },
      {
        "code": "p",
        "name": "원본관련 설명 어구",
        "repeatable": false
      },
      {
        "code": "t",
        "name": "원본 표제",
        "repeatable": false
      },
      {
        "code": "x",
        "name": "원본 ISSN",
        "repeatable": true
      },
      {
        "code": "z",
        "name": "원본 ISBN",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련 번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "535": {
    "tag": "535",
    "name": "원본/복제본 소재 주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "소장기관명",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "우편주소",
        "repeatable": true
      },
      {
        "code": "c",
        "name": "국명",
        "repeatable": true
      },
      {
        "code": "d",
        "name": "연락처",
        "repeatable": true
      },
      {
        "code": "g",
        "name": "소장처 부호",
        "repeatable": false
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "소장기관 관련 추가 정보",
        "values": {
          "1": "원본 소장기관",
          "2": "복제본 소장기관"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "536": {
    "tag": "536",
    "name": "기금정보 주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "기금정보주기",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "계약번호(Contract number)",
        "repeatable": true
      },
      {
        "code": "c",
        "name": "교부금번호(Grant number)",
        "repeatable": true
      },
      {
        "code": "d",
        "name": "고정번호(Undifferentiated number)",
        "repeatable": true
      },
      {
        "code": "e",
        "name": "프로그램 요소 번호(Program element number)",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "프로젝트 번호(Project number)",
        "repeatable": true
      },
      {
        "code": "g",
        "name": "과제 번호(Task number)",
        "repeatable": true
      },
      {
        "code": "h",
        "name": "업무단위부서 번호(Work unit number)",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "538": {
    "tag": "538",
    "name": "시스템 사항에 관한 주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "시스템에 관한 사항",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "URI",
        "repeatable": true
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "540": {
    "tag": "540",
    "name": "이용과 복제 제한에 관한 주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "이용과 복제에 관한 주기",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "소관부서 등",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "근거",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "이용권한이 있는 이용자",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "URI (Uniform Resource Idnifier)",
        "repeatable": true
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "5",
        "name": "필드 적용 기관",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "541": {
    "tag": "541",
    "name": "입수처 주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "입수처",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "주소",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "입수방법(구입, 수증, 교환, 대여, 기탁 등)",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "입수일자",
        "repeatable": false
      },
      {
        "code": "e",
        "name": "등록번호",
        "repeatable": false
      },
      {
        "code": "f",
        "name": "소유권자",
        "repeatable": false
      },
      {
        "code": "h",
        "name": "구입가",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "수량",
        "repeatable": true
      },
      {
        "code": "o",
        "name": "단위의 유형",
        "repeatable": true
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "5",
        "name": "필드 적용 기관",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "544": {
    "tag": "544",
    "name": "기록물의 기타 소재관계",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "소장자(기관)",
        "repeatable": true
      },
      {
        "code": "b",
        "name": "주소",
        "repeatable": true
      },
      {
        "code": "c",
        "name": "국명",
        "repeatable": true
      },
      {
        "code": "d",
        "name": "관련 자료의 표제",
        "repeatable": true
      },
      {
        "code": "e",
        "name": "출처",
        "repeatable": true
      },
      {
        "code": "n",
        "name": "설명문",
        "repeatable": true
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "자료관계",
        "values": {
          "0": "유관자료 (Associated mterials)",
          "1": "상관자료 (Related materials)",
          "b": "정보를 제공하지 않음"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "545": {
    "tag": "545",
    "name": "전기적 또는 역사적 데이터",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "전기 또는 역사 관련 주기",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "부연설명",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "URI (Uniform Resource Idnifier)",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "데이터유형",
        "values": {
          "0": "전기",
          "1": "일반적인 역사",
          "b": "정보를 제공하지 않음"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "546": {
    "tag": "546",
    "name": "언어주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "언어주기",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "언어 부호 또는 알파벳에 대한 정보",
        "repeatable": true
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "547": {
    "tag": "547",
    "name": "변경전 표제 설명 주기",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "변경전 표제 설명주기",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "550": {
    "tag": "550",
    "name": "발행처 주기",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "발행처주기",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "552": {
    "tag": "552",
    "name": "개체와 속성 정보 주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "개체(entity) 유형 표시",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "개체(entity) 유형의 정의 및 정보원",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "속성 표시",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "속성의 정의/출처",
        "repeatable": false
      },
      {
        "code": "e",
        "name": "열거된 도메인 값",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "열거된 도메인 값의 정의/출처",
        "repeatable": true
      },
      {
        "code": "g",
        "name": "도메인의 최소/최대 범위",
        "repeatable": false
      },
      {
        "code": "h",
        "name": "부호 세트 이름/출처",
        "repeatable": false
      },
      {
        "code": "i",
        "name": "재현될 수 없는 도메인",
        "repeatable": false
      },
      {
        "code": "j",
        "name": "측정/분석 속성 단위",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "속성 값의 개시일자/종료일자",
        "repeatable": false
      },
      {
        "code": "l",
        "name": "속성값의 정확도",
        "repeatable": false
      },
      {
        "code": "m",
        "name": "속성값의 정확도 설명",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "속성 측정 빈도",
        "repeatable": false
      },
      {
        "code": "o",
        "name": "개체/속성 개요",
        "repeatable": true
      },
      {
        "code": "p",
        "name": "개체/속성의 상세 인용 내용",
        "repeatable": true
      },
      {
        "code": "u",
        "name": "URI(Uniform Resource Identifier)",
        "repeatable": true
      },
      {
        "code": "z",
        "name": "디스플레이 주기",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "555": {
    "tag": "555",
    "name": "누가색인/검색도구 주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "누가색인/검색도구 주기",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "입수가능 정보원",
        "repeatable": true
      },
      {
        "code": "c",
        "name": "제어 정도",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "서지적 참조",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "URI(Uniform Resource Identifier)",
        "repeatable": true
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련 번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "표출어 제어",
        "values": {
          "0": "검색보조도구(Finding aids)",
          "8": "표출어를 생성하지 않음",
          "b": "색인"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "556": {
    "tag": "556",
    "name": "도큐멘테이션에 관한 정보 주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "도큐멘테이션에 관한 정보",
        "repeatable": false
      },
      {
        "code": "z",
        "name": "국제표준도서번호(ISBN)",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련 번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "표출어 제어",
        "values": {
          "8": "표출어 생성하지 않음",
          "b": "도큐멘테이션"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "561": {
    "tag": "561",
    "name": "소유권 및 소장내력 주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "소유권 및 소장내력 주기",
        "repeatable": false
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "5",
        "name": "필드 적용 기관",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련 번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "562": {
    "tag": "562",
    "name": "사본/판본 식별 주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "식별 표시(Identifying markings)",
        "repeatable": true
      },
      {
        "code": "b",
        "name": "사본 식별(Copy identification)",
        "repeatable": true
      },
      {
        "code": "c",
        "name": "판본 식별(Version identification)",
        "repeatable": true
      },
      {
        "code": "d",
        "name": "발표 형식(Presentation format)",
        "repeatable": true
      },
      {
        "code": "e",
        "name": "사본 수",
        "repeatable": true
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "5",
        "name": "필드 적용 기관",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련 번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "563": {
    "tag": "563",
    "name": "제본정보 주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "제본주기",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "URI(Uniform Resource Identifier)",
        "repeatable": true
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "5",
        "name": "필드적용기관",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "565": {
    "tag": "565",
    "name": "사례조사파일 특성 주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "항목수",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "항목명",
        "repeatable": true
      },
      {
        "code": "c",
        "name": "분석단위",
        "repeatable": true
      },
      {
        "code": "d",
        "name": "데이터 범위",
        "repeatable": true
      },
      {
        "code": "e",
        "name": "파일 구조 또는 부호",
        "repeatable": true
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "표출어 제어",
        "values": {
          "0": "사례조사파일의 특성",
          "8": "표출어를 생성하지 않음",
          "b": "파일 크기"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "567": {
    "tag": "567",
    "name": "방법 주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "방법 주기",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "표출어 제어",
        "values": {
          "8": "표출어를 생성하지 않음",
          "b": "방법"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "580": {
    "tag": "580",
    "name": "연관저록 설명 주기",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "연관저록 설명주기",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "581": {
    "tag": "581",
    "name": "참조정보원 주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "참조정보원 주기",
        "repeatable": false
      },
      {
        "code": "z",
        "name": "ISBN",
        "repeatable": true
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "표출어 제어",
        "values": {
          "8": "표출어를 생성하지 않음",
          "b": "참조정보원"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "583": {
    "tag": "583",
    "name": "보존처리 주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "처리",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "처리 확인",
        "repeatable": true
      },
      {
        "code": "c",
        "name": "처리 시기",
        "repeatable": true
      },
      {
        "code": "d",
        "name": "처리 간격",
        "repeatable": true
      },
      {
        "code": "e",
        "name": "사건",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "인증",
        "repeatable": true
      },
      {
        "code": "h",
        "name": "처리에 대한 책임 사항",
        "repeatable": true
      },
      {
        "code": "i",
        "name": "처리방법",
        "repeatable": true
      },
      {
        "code": "j",
        "name": "처리 소재지",
        "repeatable": true
      },
      {
        "code": "k",
        "name": "처리 기관",
        "repeatable": true
      },
      {
        "code": "l",
        "name": "상태",
        "repeatable": true
      },
      {
        "code": "n",
        "name": "범위",
        "repeatable": true
      },
      {
        "code": "o",
        "name": "단위 유형",
        "repeatable": true
      },
      {
        "code": "u",
        "name": "URI (Uniform Resource Identifier)",
        "repeatable": true
      },
      {
        "code": "x",
        "name": "비공개 주기",
        "repeatable": true
      },
      {
        "code": "z",
        "name": "공개 주기",
        "repeatable": true
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "5",
        "name": "필드 적용 기관",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "584": {
    "tag": "584",
    "name": "이용 누적 및 빈도 주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "이용 누적치",
        "repeatable": true
      },
      {
        "code": "b",
        "name": "이용 빈도",
        "repeatable": true
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "5",
        "name": "필드 적용 기관",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "585": {
    "tag": "585",
    "name": "전시 주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "전시 주기",
        "repeatable": false
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "5",
        "name": "필드 적용 기관",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "586": {
    "tag": "586",
    "name": "수상 주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "수상주기",
        "repeatable": false
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "표출어 제어",
        "values": {
          "8": "표출어를 생성하지 않음",
          "b": "수상"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "590": {
    "tag": "590",
    "name": "소장본 주기",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "낙장(落張), 파손(破損), 배접(背接), 보사(補寫), 포갑(包匣)",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "인문(印文)",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "장서기(藏書記), 수증기(受贈記), 수령기(受領記), 수권기(受券記)",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "지어(識語), 묵서(墨書)",
        "repeatable": false
      },
      {
        "code": "w",
        "name": "소장 원본, 복제본의 청구기호",
        "repeatable": false
      },
      {
        "code": "x",
        "name": "소장 원본, 복제본의 형태사항",
        "repeatable": false
      },
      {
        "code": "y",
        "name": "열람용 소장본",
        "repeatable": false
      },
      {
        "code": "z",
        "name": "소장 관련 관리부호",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "600": {
    "tag": "600",
    "name": "주제명부출표목 - 개인명",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "개인명(성과 이름)",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "이름(名)에 포함되어 세계(世系)를 칭하는 숫자",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "이름 관련 정보(직위, 칭호 및 기타 명칭, 역조(歷朝), 국명(國名), 한국 및 중국의 세계(世系))",
        "repeatable": true
      },
      {
        "code": "d",
        "name": "생몰년",
        "repeatable": false
      },
      {
        "code": "e",
        "name": "역할어",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "저작 연도",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "기타 정보",
        "repeatable": false
      },
      {
        "code": "h",
        "name": "자료유형표시",
        "repeatable": false
      },
      {
        "code": "j",
        "name": "속성 한정어",
        "repeatable": true
      },
      {
        "code": "k",
        "name": "형식부표목",
        "repeatable": true
      },
      {
        "code": "l",
        "name": "저작의 언어",
        "repeatable": false
      },
      {
        "code": "m",
        "name": "연주수단",
        "repeatable": true
      },
      {
        "code": "n",
        "name": "책$권차, 편차",
        "repeatable": true
      },
      {
        "code": "o",
        "name": "편곡",
        "repeatable": false
      },
      {
        "code": "p",
        "name": "저작의 편제",
        "repeatable": true
      },
      {
        "code": "q",
        "name": "이름의 완전형",
        "repeatable": false
      },
      {
        "code": "r",
        "name": "음악자료의 장조",
        "repeatable": false
      },
      {
        "code": "s",
        "name": "판",
        "repeatable": false
      },
      {
        "code": "t",
        "name": "저작의 표제",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "소속",
        "repeatable": false
      },
      {
        "code": "v",
        "name": "형식세목",
        "repeatable": true
      },
      {
        "code": "x",
        "name": "일반세목",
        "repeatable": true
      },
      {
        "code": "y",
        "name": "시대세목",
        "repeatable": true
      },
      {
        "code": "z",
        "name": "지리세목",
        "repeatable": true
      },
      {
        "code": "2",
        "name": "주제명표/시소러스",
        "repeatable": false
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "4",
        "name": "역할어 부호",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "개인명의 유형",
        "values": {
          "0": "성으로 시작하지 않는 이름(forename)",
          "1": "성으로 시작하는 이름(surname)",
          "3": "가계명(家系名, family name)"
        }
      },
      "2": {
        "name": "주제명표/시소러스",
        "values": {
          "0": "미국국회도서관 주제명표(LCSH)",
          "1": "미국국회도서관 아동문학용 주제명표",
          "2": "미국의학주제명표(MeSH)",
          "3": "미국국립농학도서관 주제명전거파일",
          "4": "특정정보원이 아닌 경우",
          "7": "$2에 주제명표 명칭을 직접 입력하는 경우",
          "8": "국립중앙도서관 주제명표(NLSH)"
        }
      }
    }
  },
  "610": {
    "tag": "610",
    "name": "주제명부출표목 - 단체명",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "기본요소",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "하위기관",
        "repeatable": true
      },
      {
        "code": "c",
        "name": "회의 개최지",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "회의 일자나 조약 체결일자",
        "repeatable": true
      },
      {
        "code": "e",
        "name": "역할어",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "저작 연도",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "기타정보",
        "repeatable": false
      },
      {
        "code": "h",
        "name": "자료유형표시",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "형식부표목",
        "repeatable": true
      },
      {
        "code": "l",
        "name": "저작의 언어",
        "repeatable": false
      },
      {
        "code": "m",
        "name": "연주수단",
        "repeatable": true
      },
      {
        "code": "n",
        "name": "분과 및 부회 회의 회차",
        "repeatable": true
      },
      {
        "code": "o",
        "name": "편곡",
        "repeatable": false
      },
      {
        "code": "p",
        "name": "저작의 편제",
        "repeatable": true
      },
      {
        "code": "r",
        "name": "음악자료의 장조",
        "repeatable": false
      },
      {
        "code": "s",
        "name": "판",
        "repeatable": false
      },
      {
        "code": "t",
        "name": "저작의 표제",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "소속",
        "repeatable": false
      },
      {
        "code": "v",
        "name": "형식세목",
        "repeatable": true
      },
      {
        "code": "x",
        "name": "일반세목",
        "repeatable": true
      },
      {
        "code": "y",
        "name": "시대세목",
        "repeatable": true
      },
      {
        "code": "z",
        "name": "지리세목",
        "repeatable": true
      },
      {
        "code": "2",
        "name": "주제명표/시소러스",
        "repeatable": false
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "4",
        "name": "역할어 부호",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "주제명표",
        "values": {
          "0": "미국국회도서관 주제명표(LCSH)",
          "1": "미국국회도서관 아동문학용 주제명표",
          "2": "미국의학주제명표(MeSH)",
          "3": "미국국립농학도서관 주제명전거파일",
          "4": "특정정보원이 아닌 경우",
          "7": "$2에 주제명표 명칭을 직접 입력하는 경우",
          "8": "국립중앙도서관 주제명표(NLSH)"
        }
      }
    }
  },
  "611": {
    "tag": "611",
    "name": "주제명부출표목 - 회의명",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "회의명",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "회의장소",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "회의일자",
        "repeatable": false
      },
      {
        "code": "e",
        "name": "하위 단위",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "저작 연도",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "기타 정보",
        "repeatable": false
      },
      {
        "code": "h",
        "name": "자료유형표시",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "형식부표목",
        "repeatable": true
      },
      {
        "code": "l",
        "name": "저작의 언어",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "분과 및 부회 회의 회차",
        "repeatable": true
      },
      {
        "code": "p",
        "name": "회차표제",
        "repeatable": true
      },
      {
        "code": "s",
        "name": "판",
        "repeatable": false
      },
      {
        "code": "t",
        "name": "저작의 표제",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "소속",
        "repeatable": false
      },
      {
        "code": "v",
        "name": "형식세목",
        "repeatable": true
      },
      {
        "code": "x",
        "name": "일반세목",
        "repeatable": true
      },
      {
        "code": "y",
        "name": "시대세목",
        "repeatable": true
      },
      {
        "code": "z",
        "name": "지리세목",
        "repeatable": true
      },
      {
        "code": "2",
        "name": "주제명표/시소러스",
        "repeatable": false
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "4",
        "name": "역할어 부호",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "주제명표/시소러스",
        "values": {
          "0": "미국국회도서관 주제명표(LCSH)",
          "1": "미국국회도서관 아동문학용 주제명표",
          "2": "미국의학주제명표(MeSH)",
          "3": "미국국립농학도서관 주제명전거파일",
          "4": "특정정보원이 아닌 경우",
          "7": "$2에 주제명표의 명칭을 직접 입력하는 경우",
          "8": "국립중앙도서관 주제명표(NLSH)"
        }
      }
    }
  },
  "630": {
    "tag": "630",
    "name": "주제명부출표목 - 통일표제",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "통일표제",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "조약체결일자",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "저작 연도",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "기타 정보",
        "repeatable": false
      },
      {
        "code": "h",
        "name": "자료유형표시",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "형식부표목",
        "repeatable": true
      },
      {
        "code": "l",
        "name": "저작의 언어",
        "repeatable": false
      },
      {
        "code": "m",
        "name": "연주수단",
        "repeatable": true
      },
      {
        "code": "n",
        "name": "권차",
        "repeatable": true
      },
      {
        "code": "o",
        "name": "편곡",
        "repeatable": false
      },
      {
        "code": "p",
        "name": "권차표제",
        "repeatable": true
      },
      {
        "code": "r",
        "name": "음악자료의 장조",
        "repeatable": false
      },
      {
        "code": "s",
        "name": "판",
        "repeatable": false
      },
      {
        "code": "t",
        "name": "저작의 표제",
        "repeatable": false
      },
      {
        "code": "v",
        "name": "형식세목",
        "repeatable": true
      },
      {
        "code": "x",
        "name": "일반세목",
        "repeatable": true
      },
      {
        "code": "y",
        "name": "시대세목",
        "repeatable": true
      },
      {
        "code": "z",
        "name": "지리세목",
        "repeatable": true
      },
      {
        "code": "2",
        "name": "주제명표/시소러스",
        "repeatable": false
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "관제 및 관사 출력형태",
        "values": {
          "0": "그대로 인쇄",
          "1": "원괄호를 제외하고 인쇄"
        }
      },
      "2": {
        "name": "그대로 인쇄",
        "values": {
          "0": "미국국회도서관 주제명표(LCSH)",
          "1": "미국국회도서관 아동문학용 주제명표",
          "2": "미국의학주제명표(MeSH)",
          "3": "미국국립농학도서관 주제명전거파일",
          "4": "특정정보원이 아닌 경우",
          "7": "$2에 주제명의 명칭을 직접 입력하는 경우",
          "8": "국립중앙도서관 주제명표(NLSH)"
        }
      }
    }
  },
  "650": {
    "tag": "650",
    "name": "주제명부출표목 - 일반주제명",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "일반주제명",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "사건발생지",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "발생일자",
        "repeatable": false
      },
      {
        "code": "e",
        "name": "역할어",
        "repeatable": false
      },
      {
        "code": "v",
        "name": "형식세목",
        "repeatable": true
      },
      {
        "code": "x",
        "name": "일반세목",
        "repeatable": true
      },
      {
        "code": "y",
        "name": "시대세목",
        "repeatable": true
      },
      {
        "code": "z",
        "name": "지리세목",
        "repeatable": true
      },
      {
        "code": "2",
        "name": "주제명표/시소러스",
        "repeatable": false
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "주제의 수준",
        "values": {
          "0": "수준 없음",
          "1": "1차 수준",
          "2": "2차 수준",
          "b": "정보를 제공하지 않음"
        }
      },
      "2": {
        "name": "주제명표/시소러스",
        "values": {
          "0": "미국국회도서관 주제명표(LCSH)",
          "1": "미국국회도서관 아동문학용 주제명표",
          "2": "미국의학주제명표(MeSH)",
          "3": "미국국립농학도서관 주제명전거파일",
          "4": "특정정보원이 아닌 경우",
          "7": "$2에 주제명표의 명칭을 직접 입력하는 경우",
          "8": "국립중앙도서관 주제명표(NLSH)"
        }
      }
    }
  },
  "651": {
    "tag": "651",
    "name": "주제명부출표목 - 지명",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "지명(地名)",
        "repeatable": false
      },
      {
        "code": "v",
        "name": "형식세목",
        "repeatable": true
      },
      {
        "code": "x",
        "name": "일반세목",
        "repeatable": true
      },
      {
        "code": "y",
        "name": "시대세목",
        "repeatable": true
      },
      {
        "code": "z",
        "name": "지리세목",
        "repeatable": true
      },
      {
        "code": "2",
        "name": "주제명표/시소러스",
        "repeatable": false
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "주제명표/시소러스",
        "values": {
          "0": "미국국회도서관 주제명표(LCSH)",
          "1": "미국국회도서관 아동문학용 주제명표",
          "2": "미국의학주제명표(MeSH)",
          "3": "미국국립농학도서관 주제명전거파일",
          "4": "특정정보원이 아닌 경우",
          "7": "$2에 주제명표의 명칭을 직접 입력하는 경우",
          "8": "국립중앙도서관 주제명표(NLSH)"
        }
      }
    }
  },
  "653": {
    "tag": "653",
    "name": "비통제 색인어",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "비통제 색인어",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "색인어의 수준",
        "values": {
          "0": "수준 없음",
          "1": "1차 수준",
          "2": "2차 수준",
          "b": "정보를 제공하지 않음"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "654": {
    "tag": "654",
    "name": "주제명부출표목 - 패싯 주제어",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "핵심어",
        "repeatable": true
      },
      {
        "code": "b",
        "name": "비핵심어",
        "repeatable": true
      },
      {
        "code": "c",
        "name": "패싯/계층 지정",
        "repeatable": true
      },
      {
        "code": "v",
        "name": "형식세목",
        "repeatable": true
      },
      {
        "code": "y",
        "name": "시대세목",
        "repeatable": true
      },
      {
        "code": "z",
        "name": "지리세목",
        "repeatable": true
      },
      {
        "code": "2",
        "name": "주제명표/시소러스",
        "repeatable": false
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련 번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "주제의 수준",
        "values": {
          "0": "수준없음",
          "1": "주요 주제",
          "2": "보조 주제",
          "b": "정보를 제공하지 않음"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "655": {
    "tag": "655",
    "name": "색인어 - 장르/형식",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "자료 또는 핵심어의 유형(장르)/형식",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "비핵심어",
        "repeatable": true
      },
      {
        "code": "c",
        "name": "패싯/계층 지정",
        "repeatable": true
      },
      {
        "code": "v",
        "name": "형식세목",
        "repeatable": true
      },
      {
        "code": "x",
        "name": "일반세목",
        "repeatable": true
      },
      {
        "code": "y",
        "name": "시대세목",
        "repeatable": true
      },
      {
        "code": "z",
        "name": "지리세목",
        "repeatable": true
      },
      {
        "code": "2",
        "name": "주제명표/시소러스",
        "repeatable": false
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "5",
        "name": "필드적용기관",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "표목 유형",
        "values": {
          "0": "패싯",
          "b": "기본"
        }
      },
      "2": {
        "name": "용어의 정보원",
        "values": {
          "7": "$2에 용어의 정보원 명칭을 직접 입력하는 경우"
        }
      }
    }
  },
  "656": {
    "tag": "656",
    "name": "색인어 - 직업",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "직업",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "형식",
        "repeatable": false
      },
      {
        "code": "v",
        "name": "형식세목",
        "repeatable": true
      },
      {
        "code": "x",
        "name": "일반세목",
        "repeatable": true
      },
      {
        "code": "y",
        "name": "시대세목",
        "repeatable": true
      },
      {
        "code": "z",
        "name": "지리세목",
        "repeatable": true
      },
      {
        "code": "2",
        "name": "주제명표/시소러스",
        "repeatable": false
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "용어의 정보원",
        "values": {
          "7": "$2에 용어의 정보원 명칭을 직접 입력하는 경우"
        }
      }
    }
  },
  "657": {
    "tag": "657",
    "name": "색인어 - 기능",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "기능",
        "repeatable": false
      },
      {
        "code": "v",
        "name": "형식세목",
        "repeatable": true
      },
      {
        "code": "x",
        "name": "일반세목",
        "repeatable": true
      },
      {
        "code": "y",
        "name": "시대세목",
        "repeatable": true
      },
      {
        "code": "z",
        "name": "지리세목",
        "repeatable": true
      },
      {
        "code": "2",
        "name": "주제명표/시소러스",
        "repeatable": false
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "용어의 정보원",
        "values": {
          "7": "$2에 용어의 정보원 명칭을 직접 입력하는 경우"
        }
      }
    }
  },
  "658": {
    "tag": "658",
    "name": "색인어 - 교과과정 목표",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "주요 교과과정 목표 (Main curriculum objective)",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "부차적인 교과과정 목표 (Subordinate curriculum objective)",
        "repeatable": true
      },
      {
        "code": "c",
        "name": "교과과정 부호 (Curriculum code)",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "상관척도 (Correlation factor)",
        "repeatable": false
      },
      {
        "code": "2",
        "name": "주제명표/시소러스",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "700": {
    "tag": "700",
    "name": "부출표목 - 개인명",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "개인명(성과 이름)",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "이름(명)에 포함되어 세계(世系)를 칭하는 숫자",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "이름 관련 정보(직위, 칭호 및 기타 명칭, 역조(歷朝), 국명(國名),한국 및  중국의 세계(世系))",
        "repeatable": true
      },
      {
        "code": "d",
        "name": "생몰년",
        "repeatable": false
      },
      {
        "code": "e",
        "name": "역할어",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "저작 연도",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "기타 정보",
        "repeatable": false
      },
      {
        "code": "h",
        "name": "자료유형표시",
        "repeatable": false
      },
      {
        "code": "j",
        "name": "속성한정어",
        "repeatable": true
      },
      {
        "code": "k",
        "name": "형식부표목",
        "repeatable": true
      },
      {
        "code": "l",
        "name": "저작의 언어",
        "repeatable": false
      },
      {
        "code": "m",
        "name": "연주수단",
        "repeatable": true
      },
      {
        "code": "n",
        "name": "책$권차, 편차",
        "repeatable": true
      },
      {
        "code": "o",
        "name": "편곡",
        "repeatable": false
      },
      {
        "code": "p",
        "name": "저작의 편제",
        "repeatable": true
      },
      {
        "code": "q",
        "name": "이름의 완전형",
        "repeatable": false
      },
      {
        "code": "r",
        "name": "음악자료의 장조",
        "repeatable": false
      },
      {
        "code": "s",
        "name": "판",
        "repeatable": false
      },
      {
        "code": "t",
        "name": "저작의 표제",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "소속",
        "repeatable": false
      },
      {
        "code": "x",
        "name": "국제표준연속간행물번호",
        "repeatable": false
      },
      {
        "code": "3",
        "name": "자료 범위 지정",
        "repeatable": false
      },
      {
        "code": "4",
        "name": "역할어 부호",
        "repeatable": true
      },
      {
        "code": "5",
        "name": "필드 적용 기관",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "개인명의 유형",
        "values": {
          "0": "성으로 시작하지 않는 이름(forename)",
          "1": "성으로 시작하는 이름(surname)",
          "3": "가계명(家系名, family name)"
        }
      },
      "2": {
        "name": "부출표목의 유형",
        "values": {
          "2": "분출표목",
          "b": "정보가 제공되지 않음"
        }
      }
    }
  },
  "710": {
    "tag": "710",
    "name": "부출표목 - 단체명",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "기본요소(체계상 상위기관명 또는 특수표목으로서의 첫요소)",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "하위기관",
        "repeatable": true
      },
      {
        "code": "c",
        "name": "회의 개최지",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "회의일자나 조약체결일자",
        "repeatable": true
      },
      {
        "code": "e",
        "name": "역할어",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "저작 연도",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "기타정보",
        "repeatable": false
      },
      {
        "code": "h",
        "name": "자료유형표시",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "형식부표목",
        "repeatable": true
      },
      {
        "code": "l",
        "name": "저작의 언어",
        "repeatable": false
      },
      {
        "code": "m",
        "name": "연주수단",
        "repeatable": true
      },
      {
        "code": "n",
        "name": "분과 및 부회 회의 회차",
        "repeatable": true
      },
      {
        "code": "o",
        "name": "편곡",
        "repeatable": false
      },
      {
        "code": "p",
        "name": "저작의 편제",
        "repeatable": true
      },
      {
        "code": "r",
        "name": "음악자료의 장조",
        "repeatable": false
      },
      {
        "code": "s",
        "name": "판",
        "repeatable": false
      },
      {
        "code": "t",
        "name": "저작의 표제",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "소속",
        "repeatable": false
      },
      {
        "code": "x",
        "name": "ISSN",
        "repeatable": false
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "4",
        "name": "역할어 부호",
        "repeatable": true
      },
      {
        "code": "5",
        "name": "필드 적용 기관",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "부출표목의 유형",
        "values": {
          "2": "분출표목",
          "b": "정보가 제공되지 않음"
        }
      }
    }
  },
  "711": {
    "tag": "711",
    "name": "부출표목 - 회의명",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "회의명",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "회의장소",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "회의일자",
        "repeatable": false
      },
      {
        "code": "e",
        "name": "하위 단위",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "저작 연도",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "기타 정보",
        "repeatable": false
      },
      {
        "code": "h",
        "name": "자료유형표시",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "형식부표목",
        "repeatable": true
      },
      {
        "code": "l",
        "name": "저작의 언어",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "분과 및 부회 회의 회차",
        "repeatable": true
      },
      {
        "code": "p",
        "name": "회차표제",
        "repeatable": true
      },
      {
        "code": "s",
        "name": "판",
        "repeatable": false
      },
      {
        "code": "t",
        "name": "저작의 표제",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "소속",
        "repeatable": false
      },
      {
        "code": "x",
        "name": "ISSN",
        "repeatable": false
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "4",
        "name": "역할어 부호",
        "repeatable": true
      },
      {
        "code": "5",
        "name": "필드 적용 기관",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "부출표목의 유형",
        "values": {
          "2": "분출표목",
          "b": "정보가 제공되지 않음"
        }
      }
    }
  },
  "720": {
    "tag": "720",
    "name": "부출표목 - 통제되지 않은 이름",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "이름",
        "repeatable": false
      },
      {
        "code": "e",
        "name": "역할어",
        "repeatable": true
      },
      {
        "code": "4",
        "name": "역할어 부호",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "이름의 유형",
        "values": {
          "1": "개인명",
          "2": "개인명 이외의 이름",
          "b": "이름의 유형을 구분하지 않음"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "730": {
    "tag": "730",
    "name": "부출표목 - 통일표제",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "통일표제",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "조약체결일자",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "저작 연도",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "기타 정보",
        "repeatable": false
      },
      {
        "code": "h",
        "name": "자료유형표시",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "형식부표목",
        "repeatable": true
      },
      {
        "code": "l",
        "name": "저작의 언어",
        "repeatable": false
      },
      {
        "code": "m",
        "name": "연주수단",
        "repeatable": true
      },
      {
        "code": "n",
        "name": "권차",
        "repeatable": true
      },
      {
        "code": "o",
        "name": "편곡",
        "repeatable": false
      },
      {
        "code": "p",
        "name": "권차표제",
        "repeatable": true
      },
      {
        "code": "r",
        "name": "음악자료의 장조",
        "repeatable": false
      },
      {
        "code": "s",
        "name": "판",
        "repeatable": false
      },
      {
        "code": "t",
        "name": "저작의 표제",
        "repeatable": false
      },
      {
        "code": "x",
        "name": "ISSN",
        "repeatable": false
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "5",
        "name": "필드 적용 기관",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "관제 및 관사 출력형태",
        "values": {
          "0": "그대로 인쇄",
          "1": "원괄호를 제외하고 인쇄",
          "2": "분출표목"
        }
      }
    }
  },
  "740": {
    "tag": "740",
    "name": "부출표목 - 비통제 관련/분출 표제",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "부출표제",
        "repeatable": false
      },
      {
        "code": "h",
        "name": "자료유형표시",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "권차 또는 편차",
        "repeatable": true
      },
      {
        "code": "p",
        "name": "저작의 편제",
        "repeatable": true
      },
      {
        "code": "5",
        "name": "필드 적용 기관",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "부출표목의 유형",
        "values": {
          "2": "분출표목",
          "b": "정보가 제공되지 않음"
        }
      }
    }
  },
  "752": {
    "tag": "752",
    "name": "부출표목 - 계층적 지명",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "국명 (Country)",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "도(道), 주(州), 준주(準州) (State, province, territory)",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "군, 읍, 면, 도서(島嶼)지역 (County, region, islands area)",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "시 (City)",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "753": {
    "tag": "753",
    "name": "컴퓨터파일로 접근하는 시스템 세목",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "기종",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "프로그래밍 언어",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "운영체제",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "754": {
    "tag": "754",
    "name": "부출표목 - 분류학명",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "분류학명",
        "repeatable": true
      },
      {
        "code": "c",
        "name": "분류학명 범주",
        "repeatable": true
      },
      {
        "code": "d",
        "name": "공통 또는 대체 학명",
        "repeatable": true
      },
      {
        "code": "x",
        "name": "비공개주기",
        "repeatable": true
      },
      {
        "code": "z",
        "name": "공개주기",
        "repeatable": true
      },
      {
        "code": "2",
        "name": "분류학명 구별 정보원",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "760": {
    "tag": "760",
    "name": "상위총서저록",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "기본표목",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "판차",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "부가적 식별정보",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "발행지, 발행처, 발행년",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "관계표시",
        "repeatable": true
      },
      {
        "code": "h",
        "name": "형태기술",
        "repeatable": false
      },
      {
        "code": "i",
        "name": "출력문장",
        "repeatable": false
      },
      {
        "code": "m",
        "name": "대상자료별 세부사항",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "주기",
        "repeatable": true
      },
      {
        "code": "o",
        "name": "기타 식별기호",
        "repeatable": true
      },
      {
        "code": "s",
        "name": "통일표제",
        "repeatable": false
      },
      {
        "code": "t",
        "name": "표제",
        "repeatable": false
      },
      {
        "code": "w",
        "name": "레코드제어번호",
        "repeatable": true
      },
      {
        "code": "x",
        "name": "국제표준연속간행물번호(ISSN)",
        "repeatable": false
      },
      {
        "code": "y",
        "name": "CODEN 표시",
        "repeatable": false
      },
      {
        "code": "7",
        "name": "제어관련 식별기호",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "주기 표시 제어",
        "values": {
          "0": "주기로 표시한다.",
          "1": "주기로 표시하지 않는다."
        }
      },
      "2": {
        "name": "표출어 제어",
        "values": {
          "8": "표출어를 생성하지 않음",
          "b": "상위총서(Main series)"
        }
      }
    }
  },
  "762": {
    "tag": "762",
    "name": "하위총서저록",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "기본표목",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "판차",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "부가적 식별정보",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "발행지, 발행처, 발행년",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "관계표시",
        "repeatable": true
      },
      {
        "code": "h",
        "name": "형태기술",
        "repeatable": false
      },
      {
        "code": "i",
        "name": "출력문장",
        "repeatable": false
      },
      {
        "code": "m",
        "name": "대상자료별 세부사항",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "주기(Note)",
        "repeatable": true
      },
      {
        "code": "o",
        "name": "기타 식별기호",
        "repeatable": true
      },
      {
        "code": "s",
        "name": "통일표제",
        "repeatable": false
      },
      {
        "code": "t",
        "name": "표제",
        "repeatable": false
      },
      {
        "code": "w",
        "name": "레코드제어번호",
        "repeatable": true
      },
      {
        "code": "x",
        "name": "국제표준연속간행물번호(ISSN)",
        "repeatable": false
      },
      {
        "code": "y",
        "name": "CODEN 표시",
        "repeatable": false
      },
      {
        "code": "7",
        "name": "제어관련 식별기호",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "주기 표시 제어",
        "values": {
          "0": "주기로 표시한다.",
          "1": "주기로 표시하지 않는다."
        }
      },
      "2": {
        "name": "표출어 제어",
        "values": {
          "8": "표출어를 생성하지 않음",
          "b": "하위총서(Has subseries)"
        }
      }
    }
  },
  "765": {
    "tag": "765",
    "name": "원저저록",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "기본표목",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "판차",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "부가적 식별정보",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "발행지, 발행처, 발행년",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "관계표시",
        "repeatable": true
      },
      {
        "code": "h",
        "name": "형태기술",
        "repeatable": false
      },
      {
        "code": "i",
        "name": "출력문장",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "관련자료의 총서사항",
        "repeatable": true
      },
      {
        "code": "m",
        "name": "대상자료별 세부사항",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "주기",
        "repeatable": true
      },
      {
        "code": "o",
        "name": "기타 식별기호",
        "repeatable": true
      },
      {
        "code": "r",
        "name": "보고서번호",
        "repeatable": true
      },
      {
        "code": "s",
        "name": "통일표제",
        "repeatable": false
      },
      {
        "code": "t",
        "name": "표제",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "표준기술보고서번호",
        "repeatable": false
      },
      {
        "code": "w",
        "name": "레코드제어번호",
        "repeatable": true
      },
      {
        "code": "x",
        "name": "국제표준연속간행물번호(ISSN)",
        "repeatable": false
      },
      {
        "code": "y",
        "name": "CODEN 표시",
        "repeatable": false
      },
      {
        "code": "z",
        "name": "국제표준도서번호(ISBN)",
        "repeatable": true
      },
      {
        "code": "7",
        "name": "제어관련 식별기호",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "주기 표시 제어",
        "values": {
          "0": "주기로 표시한다.",
          "1": "주기로 표시하지 않는다."
        }
      },
      "2": {
        "name": "표출어 제어",
        "values": {
          "8": "표출어를 생성하지 않음",
          "b": "원저자료(Translation of)"
        }
      }
    }
  },
  "767": {
    "tag": "767",
    "name": "번역저록",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "기본표목",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "판차",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "부가적 식별정보",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "발행지, 발행처, 발행년",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "관계표시",
        "repeatable": true
      },
      {
        "code": "h",
        "name": "형태기술",
        "repeatable": false
      },
      {
        "code": "i",
        "name": "출력문장",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "관련자료의 총서사항",
        "repeatable": true
      },
      {
        "code": "m",
        "name": "대상자료별 세부사항",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "주기",
        "repeatable": true
      },
      {
        "code": "o",
        "name": "기타 식별기호",
        "repeatable": true
      },
      {
        "code": "r",
        "name": "보고서번호",
        "repeatable": true
      },
      {
        "code": "s",
        "name": "통일표제",
        "repeatable": false
      },
      {
        "code": "t",
        "name": "표제",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "표준기술보고서번호",
        "repeatable": false
      },
      {
        "code": "w",
        "name": "레코드제어번호",
        "repeatable": true
      },
      {
        "code": "x",
        "name": "국제표준연속간행물번호(ISSN)",
        "repeatable": false
      },
      {
        "code": "y",
        "name": "CODEN 표시",
        "repeatable": false
      },
      {
        "code": "z",
        "name": "국제표준도서번호(ISBN)",
        "repeatable": true
      },
      {
        "code": "7",
        "name": "제어관련 식별기호",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "주기 표시 제어",
        "values": {
          "0": "주기로 표시한다.",
          "1": "주기로 표시하지 않는다."
        }
      },
      "2": {
        "name": "표출어 제어",
        "values": {
          "8": "표출어를 생성하지 않음",
          "b": "번역자료(Translated as)"
        }
      }
    }
  },
  "770": {
    "tag": "770",
    "name": "보유판 및 특별호 저록",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "기본표목",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "판차",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "부가적 식별정보",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "발행지, 발행처, 발행년",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "관계표시",
        "repeatable": true
      },
      {
        "code": "h",
        "name": "형태기술",
        "repeatable": false
      },
      {
        "code": "i",
        "name": "출력문장",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "관련자료의 총서사항",
        "repeatable": true
      },
      {
        "code": "m",
        "name": "대상자료별 세부사항",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "주기",
        "repeatable": true
      },
      {
        "code": "o",
        "name": "기타 식별기호",
        "repeatable": true
      },
      {
        "code": "r",
        "name": "보고서번호",
        "repeatable": true
      },
      {
        "code": "s",
        "name": "통일표제",
        "repeatable": false
      },
      {
        "code": "t",
        "name": "표제",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "표준기술보고서번호",
        "repeatable": false
      },
      {
        "code": "w",
        "name": "레코드제어번호",
        "repeatable": true
      },
      {
        "code": "x",
        "name": "국제표준연속간행물번호(ISSN)",
        "repeatable": false
      },
      {
        "code": "y",
        "name": "CODEN 표시",
        "repeatable": false
      },
      {
        "code": "z",
        "name": "국제표준도서번호(ISBN)",
        "repeatable": true
      },
      {
        "code": "7",
        "name": "제어관련 식별기호",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "주기 표시 제어",
        "values": {
          "0": "주기로 표시한다.",
          "1": "주기로 표시하지 않는다."
        }
      },
      "2": {
        "name": "표출어 제어",
        "values": {
          "8": "표출어를 생성하지 않음",
          "b": "부록/보유자료(Has supplement)"
        }
      }
    }
  },
  "772": {
    "tag": "772",
    "name": "모체레코드저록",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "기본표목",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "판차",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "부가적 식별정보",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "발행지, 발행처, 발행년",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "관계표시",
        "repeatable": true
      },
      {
        "code": "h",
        "name": "형태기술",
        "repeatable": false
      },
      {
        "code": "i",
        "name": "출력문장",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "관련자료의 총서사항",
        "repeatable": true
      },
      {
        "code": "m",
        "name": "대상자료별 세부사항",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "주기",
        "repeatable": true
      },
      {
        "code": "o",
        "name": "기타 식별기호",
        "repeatable": true
      },
      {
        "code": "r",
        "name": "보고서번호",
        "repeatable": true
      },
      {
        "code": "s",
        "name": "통일표제",
        "repeatable": false
      },
      {
        "code": "t",
        "name": "표제",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "표준기술보고서번호",
        "repeatable": false
      },
      {
        "code": "w",
        "name": "레코드제어번호",
        "repeatable": true
      },
      {
        "code": "x",
        "name": "국제표준연속간행물번호(ISSN)",
        "repeatable": false
      },
      {
        "code": "y",
        "name": "CODEN 표시",
        "repeatable": false
      },
      {
        "code": "z",
        "name": "국제표준도서번호(ISBN)",
        "repeatable": true
      },
      {
        "code": "7",
        "name": "제어관련 식별기호",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "주기 표시 제어",
        "values": {
          "0": "주기로 표시한다.",
          "1": "주기로 표시하지 않는다."
        }
      },
      "2": {
        "name": "표출어 제어",
        "values": {
          "0": "모체자료(Parent)",
          "8": "표출어를 생성하지 않음",
          "b": "본편(Supplement to)"
        }
      }
    }
  },
  "773": {
    "tag": "773",
    "name": "기본자료저록",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "기본표목",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "판차",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "발행지, 발행처, 발행년",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "관계표시",
        "repeatable": true
      },
      {
        "code": "h",
        "name": "형태기술",
        "repeatable": false
      },
      {
        "code": "i",
        "name": "출력문장",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "관련자료의 총서사항",
        "repeatable": true
      },
      {
        "code": "m",
        "name": "대상자료별 세부사항",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "주기",
        "repeatable": true
      },
      {
        "code": "o",
        "name": "기타 식별기호",
        "repeatable": true
      },
      {
        "code": "p",
        "name": "축약표제",
        "repeatable": false
      },
      {
        "code": "q",
        "name": "번호매김과 첫 페이지(Enumeration and first page)",
        "repeatable": false
      },
      {
        "code": "r",
        "name": "보고서번호",
        "repeatable": true
      },
      {
        "code": "s",
        "name": "통일표제",
        "repeatable": false
      },
      {
        "code": "t",
        "name": "표제",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "표준기술보고서번호",
        "repeatable": false
      },
      {
        "code": "w",
        "name": "레코드제어번호",
        "repeatable": true
      },
      {
        "code": "x",
        "name": "국제표준연속간행물번호(ISSN)",
        "repeatable": false
      },
      {
        "code": "y",
        "name": "CODEN 표시",
        "repeatable": false
      },
      {
        "code": "z",
        "name": "국제표준도서번호(ISBN)",
        "repeatable": true
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "7",
        "name": "제어관련 식별기호",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "주기 표시 제어",
        "values": {
          "0": "주기로 표시한다.",
          "1": "주기로 표시하지 않는다."
        }
      },
      "2": {
        "name": "표출어 제어",
        "values": {
          "8": "표출어를 생성하지 않음",
          "b": "수록자료 (In)"
        }
      }
    }
  },
  "774": {
    "tag": "774",
    "name": "구성단위저록",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "기본표목",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "판차",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "부가적 식별정보",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "발행지, 발행처, 발행년",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "관계표시",
        "repeatable": true
      },
      {
        "code": "h",
        "name": "형태기술",
        "repeatable": false
      },
      {
        "code": "i",
        "name": "출력문장",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "관련자료의 총서사항",
        "repeatable": true
      },
      {
        "code": "m",
        "name": "대상자료별 세부사항",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "주기",
        "repeatable": true
      },
      {
        "code": "o",
        "name": "기타 식별기호",
        "repeatable": true
      },
      {
        "code": "r",
        "name": "보고서번호",
        "repeatable": true
      },
      {
        "code": "s",
        "name": "통일표제",
        "repeatable": false
      },
      {
        "code": "t",
        "name": "표제",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "표준기술보고서번호",
        "repeatable": false
      },
      {
        "code": "w",
        "name": "레코드제어번호",
        "repeatable": true
      },
      {
        "code": "x",
        "name": "국제표준연속간행물번호(ISSN)",
        "repeatable": false
      },
      {
        "code": "y",
        "name": "CODEN 표시",
        "repeatable": false
      },
      {
        "code": "z",
        "name": "국제표준도서번호(ISBN)",
        "repeatable": true
      },
      {
        "code": "7",
        "name": "제어관련 식별기호",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "주기 표시 제어",
        "values": {
          "0": "주기로 표시한다.",
          "1": "주기로 표시하지 않는다."
        }
      },
      "2": {
        "name": "표출어 제어",
        "values": {
          "8": "표출어를 생성하지 않음",
          "b": "구성단위(Constituent Unit)"
        }
      }
    }
  },
  "775": {
    "tag": "775",
    "name": "이판저록",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "기본표목",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "판차",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "부가적 식별정보",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "발행지, 발행처, 발행년",
        "repeatable": false
      },
      {
        "code": "e",
        "name": "언어부호",
        "repeatable": false
      },
      {
        "code": "f",
        "name": "국가부호",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "관계표시",
        "repeatable": true
      },
      {
        "code": "h",
        "name": "형태기술",
        "repeatable": false
      },
      {
        "code": "i",
        "name": "출력문장",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "관련자료의 총서사항",
        "repeatable": true
      },
      {
        "code": "m",
        "name": "대상자료별 세부사항",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "주기",
        "repeatable": true
      },
      {
        "code": "o",
        "name": "기타 식별기호",
        "repeatable": true
      },
      {
        "code": "r",
        "name": "보고서번호",
        "repeatable": true
      },
      {
        "code": "s",
        "name": "통일표제",
        "repeatable": false
      },
      {
        "code": "t",
        "name": "표제",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "표준기술보고서번호",
        "repeatable": false
      },
      {
        "code": "w",
        "name": "레코드제어번호",
        "repeatable": true
      },
      {
        "code": "x",
        "name": "국제표준연속간행물번호(ISSN)",
        "repeatable": false
      },
      {
        "code": "y",
        "name": "CODEN 표시",
        "repeatable": false
      },
      {
        "code": "z",
        "name": "국제표준도서번호(ISBN)",
        "repeatable": true
      },
      {
        "code": "7",
        "name": "제어관련 식별기호",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "주기 표시 제어",
        "values": {
          "0": "주기로 표시한다.",
          "1": "주기로 표시하지 않는다."
        }
      },
      "2": {
        "name": "표출어 제어",
        "values": {
          "8": "표출어를 생성하지 않음",
          "b": "이용가능한 다른 판(Other edition avaliable)"
        }
      }
    }
  },
  "776": {
    "tag": "776",
    "name": "기타형태저록",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "기본표목",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "판차",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "부가적 식별정보",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "발행지, 발행처, 발행년",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "관계표시",
        "repeatable": true
      },
      {
        "code": "h",
        "name": "형태기술",
        "repeatable": false
      },
      {
        "code": "i",
        "name": "출력문장",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "관련자료의 총서사항",
        "repeatable": true
      },
      {
        "code": "m",
        "name": "대상자료별 세부사항",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "주기",
        "repeatable": true
      },
      {
        "code": "o",
        "name": "기타 식별기호",
        "repeatable": true
      },
      {
        "code": "r",
        "name": "보고서번호",
        "repeatable": true
      },
      {
        "code": "s",
        "name": "통일표제",
        "repeatable": false
      },
      {
        "code": "t",
        "name": "표제",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "표준기술보고서번호",
        "repeatable": false
      },
      {
        "code": "w",
        "name": "레코드제어번호",
        "repeatable": true
      },
      {
        "code": "x",
        "name": "국제표준연속간행물번호(ISSN)",
        "repeatable": false
      },
      {
        "code": "y",
        "name": "CODEN 표시",
        "repeatable": false
      },
      {
        "code": "z",
        "name": "국제표준도서번호(ISBN)",
        "repeatable": true
      },
      {
        "code": "7",
        "name": "제어관련 식별기호",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "주기 표시 제어",
        "values": {
          "0": "주기로 표시한다.",
          "1": "주기로 표시하지 않는다."
        }
      },
      "2": {
        "name": "표출어 제어",
        "values": {
          "8": "표출어를 생성하지 않음",
          "b": "이용가능한 다른 형태자료 (Avaliable in another form)"
        }
      }
    }
  },
  "777": {
    "tag": "777",
    "name": "동시발간저록",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "기본표목",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "판차",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "부가적 식별정보",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "발행지, 발행처, 발행년",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "관계표시",
        "repeatable": true
      },
      {
        "code": "h",
        "name": "형태기술",
        "repeatable": false
      },
      {
        "code": "i",
        "name": "출력문장",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "관련자료의 총서사항",
        "repeatable": true
      },
      {
        "code": "m",
        "name": "대상자료별 세부사항",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "주기",
        "repeatable": true
      },
      {
        "code": "o",
        "name": "기타 식별기호",
        "repeatable": true
      },
      {
        "code": "s",
        "name": "통일표제",
        "repeatable": false
      },
      {
        "code": "t",
        "name": "표제",
        "repeatable": false
      },
      {
        "code": "w",
        "name": "레코드제어번호",
        "repeatable": true
      },
      {
        "code": "x",
        "name": "국제표준연속간행물번호(ISSN)",
        "repeatable": false
      },
      {
        "code": "y",
        "name": "CODEN 표시",
        "repeatable": false
      },
      {
        "code": "7",
        "name": "제어관련 식별기호",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "주기 표시 제어",
        "values": {
          "0": "주기로 표시한다.",
          "1": "주기로 표시하지 않는다."
        }
      },
      "2": {
        "name": "표출어 제어",
        "values": {
          "8": "표출어를 생성하지 않음",
          "b": "동시발간자료 (Issued with)"
        }
      }
    }
  },
  "780": {
    "tag": "780",
    "name": "선행저록",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "기본표목",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "판차",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "부가적 식별정보",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "발행지, 발행처, 발행년",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "관계표시",
        "repeatable": true
      },
      {
        "code": "h",
        "name": "형태기술",
        "repeatable": false
      },
      {
        "code": "i",
        "name": "출력문장",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "관련자료의 총서사항",
        "repeatable": true
      },
      {
        "code": "m",
        "name": "대상자료별 세부사항",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "주기",
        "repeatable": true
      },
      {
        "code": "o",
        "name": "기타 식별기호",
        "repeatable": true
      },
      {
        "code": "r",
        "name": "보고서번호",
        "repeatable": true
      },
      {
        "code": "s",
        "name": "통일표제",
        "repeatable": false
      },
      {
        "code": "t",
        "name": "표제",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "표준기술보고서번호",
        "repeatable": false
      },
      {
        "code": "w",
        "name": "레코드제어번호",
        "repeatable": true
      },
      {
        "code": "x",
        "name": "국제표준연속간행물번호(ISSN)",
        "repeatable": false
      },
      {
        "code": "y",
        "name": "CODEN 표시",
        "repeatable": false
      },
      {
        "code": "z",
        "name": "국제표준도서번호(ISBN)",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "주기 표시 제어",
        "values": {
          "0": "주기로 표시한다.",
          "1": "주기로 표시하지 않는다."
        }
      },
      "2": {
        "name": "관계의 유형",
        "values": {
          "0": "○○○을(를) 개제",
          "1": "○○○을(를) 일부 개제",
          "2": "○○○을(를) 대체",
          "3": "○○○을(를) 일부 대체",
          "4": "○○○과(와)○○○을(를) 합병",
          "5": "○○○을(를) 흡수",
          "6": "○○○을(를) 일부 흡수",
          "7": "○○○으로(로)부터 분리"
        }
      }
    }
  },
  "785": {
    "tag": "785",
    "name": "후속저록",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "기본표목",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "판차",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "부가적 식별정보",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "발행지, 발행처, 발행년",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "관계표시",
        "repeatable": true
      },
      {
        "code": "h",
        "name": "형태기술",
        "repeatable": false
      },
      {
        "code": "i",
        "name": "출력문장",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "관련자료의 총서사항",
        "repeatable": true
      },
      {
        "code": "m",
        "name": "대상자료별 세부사항",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "주기",
        "repeatable": true
      },
      {
        "code": "o",
        "name": "기타 식별기호",
        "repeatable": true
      },
      {
        "code": "r",
        "name": "보고서번호",
        "repeatable": true
      },
      {
        "code": "s",
        "name": "통일표제",
        "repeatable": false
      },
      {
        "code": "t",
        "name": "표제",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "표준기술보고서번호",
        "repeatable": false
      },
      {
        "code": "w",
        "name": "레코드제어번호",
        "repeatable": true
      },
      {
        "code": "x",
        "name": "국제표준연속간행물번호(ISSN)",
        "repeatable": false
      },
      {
        "code": "y",
        "name": "CODEN 표시",
        "repeatable": false
      },
      {
        "code": "z",
        "name": "국제표준도서번호(ISBN)",
        "repeatable": true
      },
      {
        "code": "7",
        "name": "제어관련 식별기호",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "주기 표시 제어",
        "values": {
          "0": "주기로 표시한다.",
          "1": "주기로 표시하지 않는다."
        }
      },
      "2": {
        "name": "관계의 유형",
        "values": {
          "0": "○○○으로(로) 개제",
          "1": "○○○으로(로) 일부 개제",
          "2": "○○○으로(로) 대체",
          "3": "○○○으로(로) 일부 대체",
          "4": "○○○으로(로) 흡수",
          "5": "○○○으로(로) 부분 흡수",
          "6": "○○○과(와) ○○○으로(로) 분리",
          "7": "○○○에 합병",
          "8": "○○○으로(로) 소급변경"
        }
      }
    }
  },
  "786": {
    "tag": "786",
    "name": "데이터의 정보원 저록",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "기본표목",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "판차",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "부가적 식별정보",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "발행지, 발행처, 발행년",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "관계표시",
        "repeatable": true
      },
      {
        "code": "h",
        "name": "형태기술",
        "repeatable": false
      },
      {
        "code": "i",
        "name": "출력문장",
        "repeatable": false
      },
      {
        "code": "j",
        "name": "내용기간",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "관련자료의 총서사항",
        "repeatable": true
      },
      {
        "code": "m",
        "name": "대상자료별 세부사항",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "주기",
        "repeatable": true
      },
      {
        "code": "o",
        "name": "기타 식별기호",
        "repeatable": true
      },
      {
        "code": "p",
        "name": "축약표제",
        "repeatable": false
      },
      {
        "code": "r",
        "name": "보고서번호",
        "repeatable": true
      },
      {
        "code": "s",
        "name": "통일표제",
        "repeatable": false
      },
      {
        "code": "t",
        "name": "표제",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "표준기술보고서번호",
        "repeatable": false
      },
      {
        "code": "v",
        "name": "정보원 제공사항",
        "repeatable": false
      },
      {
        "code": "w",
        "name": "레코드제어번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "주기 표시 제어",
        "values": {
          "0": "주기로 표시한다.",
          "1": "주기로 표시하지 않는다."
        }
      },
      "2": {
        "name": "표출어 제어",
        "values": {
          "8": "표출어를 생성하지 않음",
          "b": "데이터의 정보원 (Data Source)"
        }
      }
    }
  },
  "787": {
    "tag": "787",
    "name": "비특정적 관계저록",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "기본표목",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "판차",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "부가적 식별정보",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "발행지, 발행처, 발행년",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "관계표시",
        "repeatable": true
      },
      {
        "code": "h",
        "name": "형태기술",
        "repeatable": false
      },
      {
        "code": "i",
        "name": "출력문장",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "관련자료의 총서사항",
        "repeatable": true
      },
      {
        "code": "m",
        "name": "대상자료별 세부사항",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "주기",
        "repeatable": true
      },
      {
        "code": "o",
        "name": "기타 식별기호",
        "repeatable": true
      },
      {
        "code": "r",
        "name": "보고서번호",
        "repeatable": true
      },
      {
        "code": "s",
        "name": "통일표제",
        "repeatable": false
      },
      {
        "code": "t",
        "name": "표제",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "표준기술보고서번호",
        "repeatable": false
      },
      {
        "code": "w",
        "name": "레코드제어번호",
        "repeatable": true
      },
      {
        "code": "x",
        "name": "국제표준연속간행물번호(ISSN)",
        "repeatable": false
      },
      {
        "code": "y",
        "name": "CODEN 표시",
        "repeatable": false
      },
      {
        "code": "z",
        "name": "국제표준도서번호(ISBN)",
        "repeatable": true
      },
      {
        "code": "7",
        "name": "제어관련 식별기호",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "주기 표시 제어",
        "values": {
          "0": "주기로 표시한다.",
          "1": "주기로 표시하지 않는다."
        }
      },
      "2": {
        "name": "표출어 제어",
        "values": {
          "8": "표출어를 생성하지 않음",
          "b": "관련자료 (Related item)"
        }
      }
    }
  },
  "800": {
    "tag": "800",
    "name": "총서부출표목 - 개인명",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "개인명(성과 이름)",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "이름(名)에 포함되어 세계(世系)를 칭하는 숫자",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "이름 관련 정보(직위, 칭호 및 기타 명칭, 역조(歷朝), 국명(國名),한국 및 중국의 세계(世系))",
        "repeatable": true
      },
      {
        "code": "d",
        "name": "생몰년",
        "repeatable": false
      },
      {
        "code": "e",
        "name": "역할어",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "저작 연도",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "기타 정보",
        "repeatable": false
      },
      {
        "code": "h",
        "name": "자료유형표시",
        "repeatable": false
      },
      {
        "code": "j",
        "name": "속성한정어",
        "repeatable": true
      },
      {
        "code": "k",
        "name": "형식부표목",
        "repeatable": true
      },
      {
        "code": "l",
        "name": "저작의 언어",
        "repeatable": false
      },
      {
        "code": "m",
        "name": "연주수단",
        "repeatable": true
      },
      {
        "code": "n",
        "name": "책$권차, 편차",
        "repeatable": true
      },
      {
        "code": "o",
        "name": "편곡",
        "repeatable": false
      },
      {
        "code": "p",
        "name": "저작의 편제",
        "repeatable": true
      },
      {
        "code": "q",
        "name": "이름의 완전형",
        "repeatable": false
      },
      {
        "code": "r",
        "name": "음악자료의 장조",
        "repeatable": false
      },
      {
        "code": "s",
        "name": "판(version)",
        "repeatable": false
      },
      {
        "code": "t",
        "name": "저작의 표제",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "소속",
        "repeatable": false
      },
      {
        "code": "v",
        "name": "권차/순차표시",
        "repeatable": false
      },
      {
        "code": "4",
        "name": "역할어 부호",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "개인명의 유형",
        "values": {
          "0": "성으로 시작하지 않는 이름(forename)",
          "1": "성으로 시작하는 이름(surname)",
          "2": "미정의",
          "3": "가계명(家系名, family name)",
          "b": "미정의"
        }
      }
    }
  },
  "810": {
    "tag": "810",
    "name": "총서부출표목 - 단체명",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "단체명",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "하위기관",
        "repeatable": true
      },
      {
        "code": "c",
        "name": "회의 개최지",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "회의일자나 조약체결일자",
        "repeatable": true
      },
      {
        "code": "e",
        "name": "역할어",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "저작 연도",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "기타정보",
        "repeatable": false
      },
      {
        "code": "h",
        "name": "자료유형표시",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "형식부표목",
        "repeatable": true
      },
      {
        "code": "l",
        "name": "저작의 언어",
        "repeatable": false
      },
      {
        "code": "m",
        "name": "연주수단",
        "repeatable": true
      },
      {
        "code": "n",
        "name": "분과 및 부회 회의 회차",
        "repeatable": true
      },
      {
        "code": "o",
        "name": "편곡",
        "repeatable": false
      },
      {
        "code": "p",
        "name": "저작의 편제",
        "repeatable": true
      },
      {
        "code": "r",
        "name": "음악자료의 장조",
        "repeatable": false
      },
      {
        "code": "s",
        "name": "판",
        "repeatable": false
      },
      {
        "code": "t",
        "name": "저작의 표제",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "소속",
        "repeatable": false
      },
      {
        "code": "v",
        "name": "권차/순차표시",
        "repeatable": false
      },
      {
        "code": "4",
        "name": "역할어 부호",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "811": {
    "tag": "811",
    "name": "총서부출표목 - 회의명",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "회의명",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "회의장소",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "회의일자",
        "repeatable": false
      },
      {
        "code": "e",
        "name": "하위 단위",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "저작 연도",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "기타 정보",
        "repeatable": false
      },
      {
        "code": "h",
        "name": "자료유형표시",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "형식부표목",
        "repeatable": true
      },
      {
        "code": "l",
        "name": "저작의 언어",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "회차",
        "repeatable": true
      },
      {
        "code": "p",
        "name": "회차표제",
        "repeatable": true
      },
      {
        "code": "s",
        "name": "판",
        "repeatable": false
      },
      {
        "code": "t",
        "name": "저작의 표제",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "소속",
        "repeatable": false
      },
      {
        "code": "v",
        "name": "권차/순차표시",
        "repeatable": false
      },
      {
        "code": "4",
        "name": "역할어 부호",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "830": {
    "tag": "830",
    "name": "총서부출표목 - 통일표제",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "통일표제",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "조약체결일자",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "저작연도",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "기타 정보",
        "repeatable": false
      },
      {
        "code": "h",
        "name": "자료유형표시",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "형식 부표목",
        "repeatable": true
      },
      {
        "code": "l",
        "name": "저작의 언어",
        "repeatable": false
      },
      {
        "code": "m",
        "name": "연주수단",
        "repeatable": true
      },
      {
        "code": "n",
        "name": "권차",
        "repeatable": true
      },
      {
        "code": "o",
        "name": "편곡",
        "repeatable": false
      },
      {
        "code": "p",
        "name": "권차표제",
        "repeatable": true
      },
      {
        "code": "r",
        "name": "음악자료의 장조",
        "repeatable": false
      },
      {
        "code": "s",
        "name": "판",
        "repeatable": false
      },
      {
        "code": "t",
        "name": "저작의 표제",
        "repeatable": false
      },
      {
        "code": "v",
        "name": "권차/순차표시",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "관제 및 관사 출력형태",
        "values": {
          "0": "그대로 인쇄",
          "1": "원괄호를 제외하고 인쇄"
        }
      }
    }
  },
  "850": {
    "tag": "850",
    "name": "소장기관",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "소장기관",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "852": {
    "tag": "852",
    "name": "소장위치",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "소장도서관 부호 또는 도서관명",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "하위기관 또는 집서",
        "repeatable": true
      },
      {
        "code": "c",
        "name": "배가위치",
        "repeatable": true
      },
      {
        "code": "e",
        "name": "소장기관 주소",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "부호화된 소장 한정기호",
        "repeatable": true
      },
      {
        "code": "g",
        "name": "부호화되지 않은 소장 한정기호",
        "repeatable": true
      },
      {
        "code": "h",
        "name": "분류기호",
        "repeatable": false
      },
      {
        "code": "i",
        "name": "자료기호",
        "repeatable": true
      },
      {
        "code": "j",
        "name": "서가통제번호",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "별치기호",
        "repeatable": true
      },
      {
        "code": "l",
        "name": "배가에 사용된 서명",
        "repeatable": false
      },
      {
        "code": "m",
        "name": "권$연차",
        "repeatable": true
      },
      {
        "code": "n",
        "name": "국가부호",
        "repeatable": false
      },
      {
        "code": "t",
        "name": "복본번호",
        "repeatable": false
      },
      {
        "code": "p",
        "name": "자료 고유번호",
        "repeatable": false
      },
      {
        "code": "q",
        "name": "자료의 물리적 상태",
        "repeatable": false
      },
      {
        "code": "s",
        "name": "기사(article) 저작권료 부호",
        "repeatable": true
      },
      {
        "code": "x",
        "name": "업무용 주기",
        "repeatable": true
      },
      {
        "code": "z",
        "name": "이용자용 주기",
        "repeatable": true
      },
      {
        "code": "2",
        "name": "배가의 정보원",
        "repeatable": false
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "6",
        "name": "연결(소장처 연계번호)",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드링크와 일련번호(소장데이터 연계일련번호)",
        "repeatable": false
      }
    ],
    "indicators": {
      "1": {
        "name": "배가방식",
        "values": {
          "0": "KDCP",
          "1": "KDC",
          "2": "DDC",
          "3": "LC 분류기호",
          "4": "NLMC (미국국립의학도서관 분류기호)",
          "5": "서가번호",
          "6": "서명",
          "7": "분산배가",
          "8": "식별기호 ?2에 명시된 배가방식",
          "9": "기타",
          "b": "정보가 제공되지 않음"
        }
      },
      "2": {
        "name": "배가순서",
        "values": {
          "0": "권호순 배가를 하지 않음",
          "1": "제1차 권호순",
          "2": "제2차 권호순",
          "b": "정보가 제공되지 않음"
        }
      }
    }
  },
  "856": {
    "tag": "856",
    "name": "전자적 위치 및 접속",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "호스트명",
        "repeatable": true
      },
      {
        "code": "b",
        "name": "접근번호",
        "repeatable": true
      },
      {
        "code": "c",
        "name": "압축정보",
        "repeatable": true
      },
      {
        "code": "d",
        "name": "경로",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "파일명",
        "repeatable": true
      },
      {
        "code": "h",
        "name": "이용자 ID",
        "repeatable": false
      },
      {
        "code": "i",
        "name": "명령어",
        "repeatable": true
      },
      {
        "code": "j",
        "name": "BPS",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "비밀번호",
        "repeatable": false
      },
      {
        "code": "l",
        "name": "로그온",
        "repeatable": false
      },
      {
        "code": "m",
        "name": "접속지원",
        "repeatable": true
      },
      {
        "code": "n",
        "name": "Host 설치장소",
        "repeatable": false
      },
      {
        "code": "o",
        "name": "운영체제",
        "repeatable": false
      },
      {
        "code": "p",
        "name": "포트",
        "repeatable": false
      },
      {
        "code": "q",
        "name": "전자형식 유형",
        "repeatable": false
      },
      {
        "code": "r",
        "name": "세팅(setting)",
        "repeatable": false
      },
      {
        "code": "s",
        "name": "파일크기",
        "repeatable": true
      },
      {
        "code": "t",
        "name": "터미널 에뮬레이션",
        "repeatable": true
      },
      {
        "code": "u",
        "name": "URI (Uniform Resource Identifier)",
        "repeatable": true
      },
      {
        "code": "v",
        "name": "전자자료 이용시간",
        "repeatable": true
      },
      {
        "code": "w",
        "name": "레코드 제어번호",
        "repeatable": true
      },
      {
        "code": "x",
        "name": "업무용 주기",
        "repeatable": true
      },
      {
        "code": "y",
        "name": "링크 안내문",
        "repeatable": true
      },
      {
        "code": "z",
        "name": "이용자용 주기",
        "repeatable": true
      },
      {
        "code": "2",
        "name": "접속방법",
        "repeatable": false
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "접속방법",
        "values": {
          "0": "전자우편 (E-mail)",
          "1": "파일전송 (FTP)",
          "2": "원격접속 (Telnet)",
          "3": "전화회선 (Dial-up)",
          "4": "HTTP",
          "7": "식별기호 ?2에 명시된 접속방법",
          "b": "정보가 제공되지 않음"
        }
      },
      "2": {
        "name": "관련성/표출어 제어",
        "values": {
          "0": "자료자체",
          "1": "자료의 버전",
          "2": "관련 자료",
          "8": "표출어를 생성하지 않음",
          "b": "정보가 제공되지 않음"
        }
      }
    }
  },
  "886": {
    "tag": "886",
    "name": "외국 MARC 정보필드",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "외국 MARC 필드의 태그",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "외국 MARC 필드의 내용",
        "repeatable": false
      },
      {
        "code": "2",
        "name": "데이터 정보원",
        "repeatable": false
      },
      {
        "code": "a",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "b",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "c",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "d",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "e",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "g",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "h",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "i",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "j",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "k",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "l",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "m",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "n",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "o",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "p",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "q",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "r",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "s",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "t",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "u",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "v",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "w",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "x",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "y",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "z",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "0",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "1",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "2",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "3",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "4",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "5",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "6",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "7",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      },
      {
        "code": "9",
        "name": "외국 MARC 식별기호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "필드 유형",
        "values": {
          "0": "리더",
          "1": "가변길이 제어 필드 (002-009)",
          "2": "가변길이 데이터 필드 (010-999)"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "887": {
    "tag": "887",
    "name": "MARC가 아닌 필드 정보",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "MARC 형태가 아닌 필드 정보",
        "repeatable": false
      },
      {
        "code": "2",
        "name": "데이터의 정보원",
        "repeatable": false
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "890": {
    "tag": "890",
    "name": "미입력문자표시",
    "repeatable": false,
    "mandatory": 2,
    "subfields": [
      {
        "code": "b",
        "name": "문자를 빈칸()으로 입력한 경우",
        "repeatable": true
      },
      {
        "code": "h",
        "name": "한자를 한글로 입력한 경우",
        "repeatable": true
      },
      {
        "code": "r",
        "name": "로마자 이외의 문자를 로마자로 입력한 경우",
        "repeatable": true
      },
      {
        "code": "s",
        "name": "레코드의 단축",
        "repeatable": false
      },
      {
        "code": "x",
        "name": "한자 이외의 문자를 한글로 변형 입력한 경우",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "900": {
    "tag": "900",
    "name": "로컬표목 - 개인명",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "개인명(성과 이름)",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "이름(명)에 포함되어 세계(世系)를 칭하는 숫자",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "이름 관련 정보(직위, 칭호 및 기타 명칭, 역조(歷朝), 국명(國名), 한국 및  중국의 세계(世系))",
        "repeatable": true
      },
      {
        "code": "d",
        "name": "생몰년",
        "repeatable": false
      },
      {
        "code": "e",
        "name": "역할어",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "저작 연도",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "기타 정보",
        "repeatable": false
      },
      {
        "code": "j",
        "name": "속성한정어",
        "repeatable": true
      },
      {
        "code": "k",
        "name": "형식부표목",
        "repeatable": true
      },
      {
        "code": "l",
        "name": "저작의 언어",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "책/권차, 편차",
        "repeatable": true
      },
      {
        "code": "p",
        "name": "저작의 편제",
        "repeatable": true
      },
      {
        "code": "q",
        "name": "이름의 완전형",
        "repeatable": false
      },
      {
        "code": "t",
        "name": "저작의 표제",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "소속",
        "repeatable": false
      },
      {
        "code": "4",
        "name": "역할어 부호",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "개인명의 유형",
        "values": {
          "0": "성으로 시작하지 않는 이름",
          "1": "성으로 시작하는 이름",
          "3": "가계명(家系名)"
        }
      },
      "2": {
        "name": "부출제어",
        "values": {
          "0": "부출카드를 인쇄하지 않음",
          "1": "부출카드를 인쇄함"
        }
      }
    }
  },
  "910": {
    "tag": "910",
    "name": "로컬표목 - 단체명",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "기본요소 (체계상 상위기관명 또는 특수표목으로서의 첫 번째 요소)",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "하위기관",
        "repeatable": true
      },
      {
        "code": "c",
        "name": "회의 개최지",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "회의일자나 조약의 표제일자",
        "repeatable": true
      },
      {
        "code": "e",
        "name": "역할어",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "저작 연도",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "기타정보",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "형식부표목",
        "repeatable": true
      },
      {
        "code": "l",
        "name": "저작의 언어",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "분과 및 부회 회의 회차",
        "repeatable": true
      },
      {
        "code": "p",
        "name": "저작의 편제",
        "repeatable": true
      },
      {
        "code": "t",
        "name": "저작의 표제",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "소속",
        "repeatable": false
      },
      {
        "code": "4",
        "name": "역할어 부호",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "부출제어",
        "values": {
          "0": "부출카드를 인쇄하지 않음",
          "1": "부출카드를 인쇄함"
        }
      }
    }
  },
  "911": {
    "tag": "911",
    "name": "로컬표목 - 회의명",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "회의명",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "회의장소",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "회의일자",
        "repeatable": false
      },
      {
        "code": "e",
        "name": "하위단위",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "저작 연도",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "기타 정보",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "형식부표목",
        "repeatable": true
      },
      {
        "code": "l",
        "name": "저작의 언어",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "분과 및 부회 회의 회차",
        "repeatable": true
      },
      {
        "code": "p",
        "name": "회차표제",
        "repeatable": true
      },
      {
        "code": "t",
        "name": "저작의 표제",
        "repeatable": false
      },
      {
        "code": "u",
        "name": "소속",
        "repeatable": false
      },
      {
        "code": "4",
        "name": "역할어 부호",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "부출제어",
        "values": {
          "0": "부출카드를 인쇄하지 않음",
          "1": "부출카드를 인쇄함"
        }
      }
    }
  },
  "930": {
    "tag": "930",
    "name": "로컬표목 - 통일표제",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "통일표제",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "조약 체결일자",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "저작 연도",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "기타정보",
        "repeatable": false
      },
      {
        "code": "h",
        "name": "자료유형표시",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "형식부표목",
        "repeatable": true
      },
      {
        "code": "l",
        "name": "저작의 언어",
        "repeatable": false
      },
      {
        "code": "m",
        "name": "연주수단",
        "repeatable": true
      },
      {
        "code": "n",
        "name": "권차",
        "repeatable": true
      },
      {
        "code": "o",
        "name": "편곡",
        "repeatable": false
      },
      {
        "code": "p",
        "name": "권차표제",
        "repeatable": true
      },
      {
        "code": "r",
        "name": "음악자료의 장조",
        "repeatable": false
      },
      {
        "code": "s",
        "name": "판",
        "repeatable": false
      },
      {
        "code": "t",
        "name": "저작의 표제",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "940": {
    "tag": "940",
    "name": "로컬표목 - 표제",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "부출표제",
        "repeatable": false
      },
      {
        "code": "h",
        "name": "자료유형표시",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "권차 또는 편차",
        "repeatable": true
      },
      {
        "code": "p",
        "name": "저작의 편제",
        "repeatable": true
      },
      {
        "code": "5",
        "name": "필드 적용 기관",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "949": {
    "tag": "949",
    "name": "로컬표목 - 총서표제",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "총서표제",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "총서의 편(part)차",
        "repeatable": true
      },
      {
        "code": "p",
        "name": "총서의 편(part)제",
        "repeatable": true
      },
      {
        "code": "s",
        "name": "국제표준연속간행물번호(ISSN)",
        "repeatable": false
      },
      {
        "code": "v",
        "name": "총서번호",
        "repeatable": false
      },
      {
        "code": "x",
        "name": "대등총서표제",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "950": {
    "tag": "950",
    "name": "로컬정보 - 가격",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "$b에 기술되는 가격의 성격을 나타내는 어귀(비매품, 가격불명, 무료배포, 배포가, 회(비)원가, 특가, 장정별 등)",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "정가, 합산가, 권당가, 전질가, 추정가, 환산가",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "가격잡정보(원괄호로 묶어 기술)",
        "repeatable": false
      }
    ],
    "indicators": {
      "1": {
        "name": "가격 여부",
        "values": {
          "0": "가격이 나타나 있는 경우",
          "1": "가격이 나타나 있지 않는 경우"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "980": {
    "tag": "980",
    "name": "로컬정보 - 소장표시",
    "repeatable": false,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "소장권책？권호차(연월일)",
        "repeatable": false
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "001": {
    "tag": "001",
    "name": "제어번호(Control Number)",
    "repeatable": false,
    "mandatory": 1,
    "subfields": [],
    "indicators": {}
  },
  "003": {
    "tag": "003",
    "name": "제어번호 식별기호(Control Number Identifier)",
    "repeatable": false,
    "mandatory": 1,
    "subfields": [],
    "indicators": {}
  },
  "005": {
    "tag": "005",
    "name": "최종처리일시(Date and Time of Latest Transaction)",
    "repeatable": false,
    "mandatory": 1,
    "subfields": [],
    "indicators": {}
  },
  "006": {
    "tag": "006",
    "name": "부호화정보필드-부가적 자료 특성",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [],
    "indicators": {}
  },
  "007": {
    "tag": "007",
    "name": "형태기술필드",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [],
    "indicators": {}
  },
  "008": {
    "tag": "008",
    "name": "부호화 정보필드",
    "repeatable": false,
    "mandatory": 1,
    "subfields": [],
    "indicators": {}
  },
  "010": {
    "tag": "010",
    "name": "미국국회도서관 제어번호",
    "repeatable": false,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "미국국회도서관 제어번호",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "미국 필사자료 종합목록 제어번호",
        "repeatable": true
      },
      {
        "code": "z",
        "name": "취소/사용하지 않는 미국국회도서관 제어번호",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "012": {
    "tag": "012",
    "name": "국립중앙도서관 제어번호",
    "repeatable": false,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "국립중앙도서관 제어번호",
        "repeatable": false
      },
      {
        "code": "z",
        "name": "취소/사용하지 않는 국립중앙도서관 제어번호",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "013": {
    "tag": "013",
    "name": "특허제어정보",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "번호",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "국가",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "번호의 유형",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "일자",
        "repeatable": true
      },
      {
        "code": "e",
        "name": "상태",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "관계국 또는 관계기관",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "015": {
    "tag": "015",
    "name": "국가서지번호",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "국가서지번호",
        "repeatable": true
      },
      {
        "code": "2",
        "name": "국가서지부호",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "016": {
    "tag": "016",
    "name": "국가서지기관 제어번호",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "레코드 제어번호",
        "repeatable": false
      },
      {
        "code": "z",
        "name": "취소/사용하지 않는 레코드 제어번호",
        "repeatable": true
      },
      {
        "code": "2",
        "name": "기관명",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "국가서지기관",
        "values": {
          "7": "$2에 기관명을 직접 입력하는 경우"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "017": {
    "tag": "017",
    "name": "저작권 등록번호",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "저작권 등록번호",
        "repeatable": true
      },
      {
        "code": "b",
        "name": "번호부여기관",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "018": {
    "tag": "018",
    "name": "저작권료부호",
    "repeatable": false,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "저작권료 부호",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "020": {
    "tag": "020",
    "name": "국제표준도서번호",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "국제표준도서번호",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "입수조건",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "부가기호",
        "repeatable": false
      },
      {
        "code": "z",
        "name": "취소/사용하지 않는 국제표준도서번호",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "낱권 번호",
        "values": {
          "1": "세트 번호"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "022": {
    "tag": "022",
    "name": "국제표준연속간행물번호",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "국제표준연속간행물번호",
        "repeatable": false
      },
      {
        "code": "y",
        "name": "부정확한 국제표준연속간행물번호",
        "repeatable": true
      },
      {
        "code": "z",
        "name": "취소된 국제표준연속간행물번호",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "세분하지 않음",
        "values": {
          "0": "국제수준의 계속자료",
          "1": "국제수준의 계속자료가 아님"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "023": {
    "tag": "023",
    "name": "출판시도서목록제어번호",
    "repeatable": false,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "출판시도서목록(CIP)제어번호",
        "repeatable": false
      },
      {
        "code": "z",
        "name": "취소/사용하지 않는 출판시도서목록(CIP)제어번호",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "024": {
    "tag": "024",
    "name": "기타 표준부호",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "표준부호",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "입수조건",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "표준부호의 부가기호",
        "repeatable": false
      },
      {
        "code": "z",
        "name": "취소/사용하지 않는 부호",
        "repeatable": true
      },
      {
        "code": "2",
        "name": "부호의 정보원",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "표준부호의 유형",
        "values": {
          "0": "국제표준녹음자료부호(ISRC)",
          "1": "세계상품부호(UPC)",
          "2": "국제표준악보번호(ISMN)",
          "3": "European Article Number(EAN코드)",
          "4": "Serial Item and Contribution Identifier(SICI)",
          "7": "$2에 부호의 정보원을 직접 입력하는 경우",
          "8": "형태를 알 수 없는 표준부호"
        }
      },
      "2": {
        "name": "기호/번호의 일치여부",
        "values": {
          "0": "인쇄된 것과 기계적으로 인식한 것이 차이가 없음",
          "1": "인쇄된 것과 기계적으로 인식한 것이 차이가 있음",
          "b": "제공된 정보 없음"
        }
      }
    }
  },
  "027": {
    "tag": "027",
    "name": "표준기술보고서번호",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "표준기술보고서번호(STRN)",
        "repeatable": false
      },
      {
        "code": "z",
        "name": "취소/사용하지 않는 표준기술보고서번호",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "028": {
    "tag": "028",
    "name": "녹음, 녹화, 음악관련 발행처번호",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "발행처번호",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "발행처번호의 정보원",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "발행처 부여 번호의 유형",
        "values": {
          "0": "발행번호",
          "1": "매트릭스번호",
          "2": "플레이트번호",
          "3": "기타 음악자료번호",
          "4": "비디오 녹화자료번호",
          "5": "기타 발행처번호",
          "8": "표출어를 생성하지 않음"
        }
      },
      "2": {
        "name": "주기/부출표시",
        "values": {
          "0": "주기로 표시하지 않고 부출하지 않음",
          "1": "주기로 표시하고 부출함",
          "2": "주기로 표시하고 부출하지 않음",
          "3": "주기로 표시하지 않고 부출함"
        }
      }
    }
  },
  "030": {
    "tag": "030",
    "name": "코덴부호",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "CODEN부호",
        "repeatable": false
      },
      {
        "code": "z",
        "name": "취소/사용하지 않는 CODEN부호",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "032": {
    "tag": "032",
    "name": "우편물등기번호",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "우편물등기번호",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "번호 부여기관의 정보원",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "033": {
    "tag": "033",
    "name": "사건 일시와 장소",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "정형화된 일시",
        "repeatable": true
      },
      {
        "code": "b",
        "name": "지역부호",
        "repeatable": true
      },
      {
        "code": "c",
        "name": "지역세분부호",
        "repeatable": true
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "일시의 유형",
        "values": {
          "0": "단일 일시",
          "1": "다수 일시",
          "2": "일시의 범위",
          "b": "일시에 대한 정보 없음"
        }
      },
      "2": {
        "name": "사건의 유형",
        "values": {
          "0": "포착",
          "1": "방송",
          "2": "발견",
          "b": "해당 정보 없음"
        }
      }
    }
  },
  "034": {
    "tag": "034",
    "name": "지도제작의 수치데이터 부호",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "축척의 종류(a:직선비례 축척(Linear scale), b:각 축척(Angular scale), z:기타 축척)",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "등비수평 축척",
        "repeatable": true
      },
      {
        "code": "c",
        "name": "등비수직 축척",
        "repeatable": true
      },
      {
        "code": "d",
        "name": "좌표-최서경선",
        "repeatable": false
      },
      {
        "code": "e",
        "name": "좌표-최동경선",
        "repeatable": false
      },
      {
        "code": "f",
        "name": "좌표-최북위선",
        "repeatable": false
      },
      {
        "code": "g",
        "name": "좌표-최남위선",
        "repeatable": false
      },
      {
        "code": "h",
        "name": "각 축척",
        "repeatable": true
      },
      {
        "code": "j",
        "name": "적위-북방계",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "적위-남방계",
        "repeatable": false
      },
      {
        "code": "m",
        "name": "적경-동방계",
        "repeatable": false
      },
      {
        "code": "n",
        "name": "적경-서방계",
        "repeatable": false
      },
      {
        "code": "p",
        "name": "분점",
        "repeatable": false
      },
      {
        "code": "s",
        "name": "G-원형 위도",
        "repeatable": true
      },
      {
        "code": "t",
        "name": "G-원형 경도",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "축척의 유형",
        "values": {
          "0": "축척표시 없음",
          "1": "단일 축척",
          "3": "축척이 범위로 표시된 경우"
        }
      },
      "2": {
        "name": "링(ring)의 유형",
        "values": {
          "0": "외계 원형(Outer ring)",
          "1": "배제 원형(Exclusion ring)",
          "b": "적용불가"
        }
      }
    }
  },
  "035": {
    "tag": "035",
    "name": "협력기관 제어번호",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "도서관부호와 제어번호",
        "repeatable": false
      },
      {
        "code": "z",
        "name": "취소/사용하지 않는 도서관부호와 제어번호",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "036": {
    "tag": "036",
    "name": "컴퓨터 데이터 파일의 원연구번호",
    "repeatable": false,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "원연구번호",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "번호부여기관",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "037": {
    "tag": "037",
    "name": "입수처",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "재고번호/주문번호",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "재고번호/주문번호 부여기관",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "입수 조건",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "발행형식",
        "repeatable": true
      },
      {
        "code": "g",
        "name": "부가적 형식 특성",
        "repeatable": true
      },
      {
        "code": "n",
        "name": "주기",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "040": {
    "tag": "040",
    "name": "목록작성기관",
    "repeatable": false,
    "mandatory": 1,
    "subfields": [
      {
        "code": "a",
        "name": "최초 목록작성기관",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "목록언어",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "입력기관",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "수정기관",
        "repeatable": true
      },
      {
        "code": "e",
        "name": "기술규칙",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "041": {
    "tag": "041",
    "name": "언어부호",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "본문언어/음성녹음대(sound track)언어",
        "repeatable": true
      },
      {
        "code": "b",
        "name": "요약문언어/자막의 언어",
        "repeatable": true
      },
      {
        "code": "d",
        "name": "노래나 연설문의 언어",
        "repeatable": true
      },
      {
        "code": "e",
        "name": "가사의 언어",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "내용목차의 언어",
        "repeatable": true
      },
      {
        "code": "g",
        "name": "가사이외 딸림자료의 언어",
        "repeatable": true
      },
      {
        "code": "h",
        "name": "원저작의 언어나 중역의 언어",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "번역물 표시",
        "values": {
          "0": "번역물이 아니거나 번역물을 포함하고 있지 않는 경우",
          "1": "번역물이거나 번역물이 포함된 경우"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "042": {
    "tag": "042",
    "name": "검증부호",
    "repeatable": false,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "검증기관부호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "043": {
    "tag": "043",
    "name": "지역부호",
    "repeatable": false,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "지역구분부호",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "044": {
    "tag": "044",
    "name": "발행/제작국명부호",
    "repeatable": false,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "발행/제작국명부호",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "045": {
    "tag": "045",
    "name": "연대부호",
    "repeatable": false,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "연대부호",
        "repeatable": true
      },
      {
        "code": "b",
        "name": "기원전 9999년부터 서기까지의 형식화된 연대부호",
        "repeatable": true
      },
      {
        "code": "c",
        "name": "기원전 9999년까지의 형식화된 연대부호",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "식별기호 $b 또는 $c의 연대유형",
        "values": {
          "0": "단일연도",
          "1": "복수연도",
          "2": "범위연도",
          "b": "식별기호 $b 또는 $c가 없는 경우"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "046": {
    "tag": "046",
    "name": "특별한 연도 부호",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "발행년 유형",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "발행년 1(기원전)",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "발행년 1(기원후)",
        "repeatable": false
      },
      {
        "code": "d",
        "name": "발행년 2(기원전)",
        "repeatable": false
      },
      {
        "code": "e",
        "name": "발행년 2(기원후)",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "047": {
    "tag": "047",
    "name": "작곡형식부호",
    "repeatable": false,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "작곡형식부호",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "048": {
    "tag": "048",
    "name": "악기나 성악부호",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "연주자 또는 앙상블",
        "repeatable": true
      },
      {
        "code": "b",
        "name": "독주자 또는 독창자",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "049": {
    "tag": "049",
    "name": "소장사항",
    "repeatable": false,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "소장기관부호",
        "repeatable": false
      },
      {
        "code": "l",
        "name": "등록번호",
        "repeatable": true
      },
      {
        "code": "v",
        "name": "권/연차기호",
        "repeatable": true
      },
      {
        "code": "c",
        "name": "복본기호",
        "repeatable": true
      },
      {
        "code": "f",
        "name": "별치기호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "배가위치",
        "values": {
          "0": "해당자료 전체가 동일한 곳에 배가(별치)되는 경우",
          "1": "해당자료 전체가 동일한 곳에 배가(별치)되지 않는 경우"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "050": {
    "tag": "050",
    "name": "미국국회도서관 청구기호",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "분류기호",
        "repeatable": true
      },
      {
        "code": "b",
        "name": "도서기호",
        "repeatable": false
      },
      {
        "code": "3",
        "name": "자료 범위지정",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "자료의 미국국회도서관 소장여부",
        "values": {
          "0": "미국국회도서관 소장자료",
          "1": "미국국회도서관 미소장자료",
          "b": "정보를 제공하지 않음"
        }
      },
      "2": {
        "name": "청구기호 부여 정보원",
        "values": {
          "0": "LC에서 부여",
          "4": "LC 이외의 기관이 부여"
        }
      }
    }
  },
  "051": {
    "tag": "051",
    "name": "미국국회도서관 복사본, 발행호, 발췌 인쇄물",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "분류기호",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "도서기호",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "복본 정보",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "052": {
    "tag": "052",
    "name": "국립중앙도서관 청구기호",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "분류기호",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "도서기호",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "권/연차기호",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "자료의 국립중앙도서관 소장여부",
        "values": {
          "0": "국립중앙도서관 소장자료",
          "1": "국립중앙도서관 미소장자료",
          "2": "국립중앙도서관 분관 소장자료",
          "3": "국립중앙도서관 매체변환자료(CD-ROM)",
          "4": "국립중앙도서관 매체변환자료(마이크로자료)"
        }
      },
      "2": {
        "name": "적용 분류표",
        "values": {
          "0": "KDCP로 분류된 자료",
          "1": "KDC로 분류된 자료",
          "2": "DDC로 분류된 자료",
          "3": "조선총독부 신서부분류표로 분류된 자료",
          "4": "조선총독부 양서부분류표로 분류된 자료",
          "5": "조선총독부 고서부분류표로 분류된 자료"
        }
      }
    }
  },
  "055": {
    "tag": "055",
    "name": "지리 분류기호",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "지리 분류기호",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "하위지역 지리 분류기호",
        "repeatable": true
      },
      {
        "code": "d",
        "name": "거주지명",
        "repeatable": true
      },
      {
        "code": "2",
        "name": "분류표",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미국국회도서관 분류",
        "values": {
          "1": "미국 국방부분류",
          "7": "$2에 분류표 명칭을 직접 입력하는 경우"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "056": {
    "tag": "056",
    "name": "한국십진분류기호",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "한국십진분류기호",
        "repeatable": true
      },
      {
        "code": "b",
        "name": "도서기호",
        "repeatable": false
      },
      {
        "code": "2",
        "name": "판표시",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "060": {
    "tag": "060",
    "name": "미국국립의학도서관청구기호",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "분류기호",
        "repeatable": true
      },
      {
        "code": "b",
        "name": "도서기호",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "자료의 미국국립의학도서관 소장여부",
        "values": {
          "0": "미국국립의학도서관 소장자료",
          "1": "미국국립의학도서관 미소장자료",
          "b": "정보를 제공하지 않음"
        }
      },
      "2": {
        "name": "청구기호 부여 정보원",
        "values": {
          "0": "미국국립의학도서관 부여",
          "4": "미국국립의학도서관 이외의 기관 부여"
        }
      }
    }
  },
  "066": {
    "tag": "066",
    "name": "사용문자세트",
    "repeatable": false,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "도서관부호",
        "repeatable": false
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "070": {
    "tag": "070",
    "name": "미국국립농학도서관 청구기호",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "분류기호",
        "repeatable": true
      },
      {
        "code": "b",
        "name": "도서기호",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미국국립농학도서관 소장자료 여부",
        "values": {
          "0": "미국국립농학도서관 소장자료",
          "1": "미국국립농학도서관 미소장자료"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "072": {
    "tag": "072",
    "name": "주제범주부호",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "주제범주부호",
        "repeatable": false
      },
      {
        "code": "x",
        "name": "주제범주부호의 세목",
        "repeatable": true
      },
      {
        "code": "2",
        "name": "주제범주부호의 정보원",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "정보원",
        "values": {
          "0": "미국국립농학도서관 주제범주부호 리스트",
          "7": "식별기호 ?2에 주제범주의 정보원을 직접 입력하는 경우"
        }
      }
    }
  },
  "074": {
    "tag": "074",
    "name": "정부간행물번호",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "미국정부간행물(GPO)번호",
        "repeatable": false
      },
      {
        "code": "k",
        "name": "한국정부간행물 발간등록번호 (GPRN)",
        "repeatable": false
      },
      {
        "code": "z",
        "name": "취소/사용하지 않는 GPRN/GPO자료번호",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "080": {
    "tag": "080",
    "name": "국제십진분류기호",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "국제십진분류기호(UDC)",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "도서기호",
        "repeatable": false
      },
      {
        "code": "x",
        "name": "공통 보조 구분",
        "repeatable": true
      },
      {
        "code": "2",
        "name": "판표시",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "082": {
    "tag": "082",
    "name": "듀이십진분류기호",
    "repeatable": true,
    "mandatory": 3,
    "subfields": [
      {
        "code": "a",
        "name": "듀이십진분류기호",
        "repeatable": true
      },
      {
        "code": "b",
        "name": "도서기호",
        "repeatable": false
      },
      {
        "code": "2",
        "name": "판표시",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "판의 유형",
        "values": {
          "0": "완전판",
          "1": "요약판"
        }
      },
      "2": {
        "name": "분류기호 부여 정보원",
        "values": {
          "0": "LC에서 부여",
          "1": "국립중앙도서관에서 부여",
          "4": "LC 및 국립중앙도서관 이외의 기관에서 부여",
          "b": "정보를 제공하지 않음"
        }
      }
    }
  },
  "085": {
    "tag": "085",
    "name": "기타 분류기호",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "분류기호",
        "repeatable": true
      },
      {
        "code": "b",
        "name": "도서기호",
        "repeatable": false
      },
      {
        "code": "2",
        "name": "분류기호의 정보원",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "적용 분류표",
        "values": {
          "0": "KDCP(한국십진분류법-박봉석)",
          "1": "NDC(일본십진분류법)",
          "2": "조선총독부 신서부분류표",
          "3": "조선총독부 양서부분류표",
          "4": "조선총독부 고서부분류표",
          "5": "사부분류",
          "b": "그 외의 분류표"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "086": {
    "tag": "086",
    "name": "정부문서분류기호",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "정부문서분류기호",
        "repeatable": false
      },
      {
        "code": "z",
        "name": "취소/사용하지 않는 정부문서분류기호",
        "repeatable": true
      },
      {
        "code": "2",
        "name": "정부기관부호 또는 기관명",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "정부문서분류기호의 정보원",
        "values": {
          "0": "SuDOC (Superintendent of Documents Classification System)",
          "1": "한국 정부문서분류기호",
          "b": "식별기호 $2에 정보원이 있는 경우"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "088": {
    "tag": "088",
    "name": "보고서번호",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "보고서번호",
        "repeatable": false
      },
      {
        "code": "z",
        "name": "취소/사용하지 않는 보고서번호",
        "repeatable": true
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  },
  "090": {
    "tag": "090",
    "name": "자관 청구기호",
    "repeatable": true,
    "mandatory": 2,
    "subfields": [
      {
        "code": "a",
        "name": "분류기호",
        "repeatable": false
      },
      {
        "code": "b",
        "name": "도서기호",
        "repeatable": false
      },
      {
        "code": "c",
        "name": "권/연차기호",
        "repeatable": false
      },
      {
        "code": "8",
        "name": "필드 링크와 일련번호",
        "repeatable": true
      }
    ],
    "indicators": {
      "1": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      },
      "2": {
        "name": "미정의",
        "values": {
          "b": "미정의"
        }
      }
    }
  }
}
