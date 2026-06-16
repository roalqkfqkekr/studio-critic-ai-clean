# studio-critic-ai

`studio-critic-ai`는 건축 설계 스튜디오의 크리틱 피드백을 다음 작업 리스트, 다음 크리틱 준비 항목, 발표 문장, 포트폴리오 서사로 바꾸는 정적 AI 웹앱 MVP입니다.

목표는 ChatGPT보다 더 똑똑한 범용 AI를 만드는 것이 아니라, 사용자가 매번 프로젝트 맥락과 원하는 출력 형식을 반복해서 설명하는 시간을 줄이는 것입니다.

## ARCHIVE AI와 다른 점

기존 ARCHIVE AI가 건축 의사결정 기록 시스템에 가깝다면, `studio-critic-ai`는 크리틱 직후 바로 실행할 수 있는 스튜디오 매니저에 가깝습니다.

- 피드백을 단순 보관하지 않고 작업 카드로 변환합니다.
- 건축 전용 카테고리로 피드백을 분류합니다.
- 다음 크리틱에 필요한 도면, 다이어그램, 예상 질문을 정리합니다.
- 누적 피드백과 완료 작업을 바탕으로 포트폴리오용 설계 발전 서사를 만듭니다.

## 핵심 기능

- SaaS형 Landing Page
- 시작 방식 선택: 데모 프로젝트, 새 프로젝트, JSON 백업 불러오기
- GitHub Pages에 안전한 hash routing
- 프로젝트 생성 및 편집
- 프로젝트 삭제
- 교수 / 튜터 / 본인 / 클라이언트 / 기타 피드백 입력
- 피드백 선택, 삭제, 재분석
- Firebase AI Logic + Gemini Developer API 연결 구조
- Firebase 설정이 없을 때 Mock 모드 자동 fallback
- AI 분석 카드 생성
- 건축 전용 카테고리 태그 표시
- AI 분석 결과 기반 작업 카드 자동 생성
- 작업 상태 변경 및 작업 카드 삭제: 해야 함 / 진행 중 / 완료 / 보류
- 다음 크리틱 준비 패널 생성
- 포트폴리오 서사 초안 생성
- localStorage 자동 저장
- JSON 데이터 내보내기 / 불러오기
- localStorage 초기화 및 샘플 데이터 복원

## 현재 기본 상태

현재 기본 상태는 Mock 모드입니다.

GitHub Pages 같은 공개 정적 배포에서는 `src/firebaseConfig.js`를 올리지 않는 것이 기본이며, 이 경우 앱은 `Demo Mode`로 동작합니다. 실제 Firebase/Gemini 연결 전에도 Landing Page, 시작 방식 선택, View 전환, 피드백 입력, Mock 분석, 작업 카드 생성, JSON 백업/불러오기 흐름을 테스트할 수 있습니다.

실제 Gemini 호출을 사용하려면 `src/firebaseConfig.example.js`를 `src/firebaseConfig.js`로 복사한 뒤 Firebase 설정값을 입력해야 합니다.

`src/firebaseConfig.js`는 `.gitignore`에 포함되어 있으므로 GitHub에 올리지 않습니다.

## 화면 구조와 hash routing

앱은 하나의 `index.html` 안에서 화면을 전환하는 정적 SPA입니다.

- `#/landing`: 방문자용 Landing Page
- `#/start`: 시작 방식 선택 화면
- `#/app/home`: Home
- `#/app/feedback`: Feedback
- `#/app/analysis`: Analysis
- `#/app/tasks`: Tasks
- `#/app/critic-prep`: Critic Prep
- `#/app/portfolio`: Portfolio
- `#/app/settings`: Settings

GitHub Pages에서 URL path routing을 쓰면 새로고침 시 404가 날 수 있으므로, 이 프로젝트는 hash route를 사용합니다. 사이드바 메뉴와 시작 버튼은 hash를 변경하고, 브라우저 뒤로가기/앞으로가기도 같은 라우팅 흐름을 따릅니다.

첫 접속 시 `studioCriticEntered` 값이 없으면 `#/landing`으로 열립니다. 이미 앱에 진입한 브라우저에서는 기본값이 `#/app/home`입니다. 단, 주소창에 hash가 직접 들어 있으면 그 hash가 우선됩니다.

## 무료 운영 구조

이 MVP는 추가 서버 비용이 거의 들지 않도록 정적 웹앱으로 구성했습니다.

- 별도 Express, Render, Cloud Functions 서버 없음
- Firestore, Firebase Storage, Firebase Auth 미사용
- 데이터 저장은 브라우저 `localStorage` 사용
- 정적 파일만으로 GitHub Pages 또는 Firebase Hosting 배포 가능
- 텍스트 기반 Gemini 호출만 사용
- 이미지 생성, 영상 생성, 고급 음성 분석, 대용량 PDF 분석 제외

## Firebase Spark 전제

Firebase는 Spark 플랜 기준으로 사용할 수 있는 범위만 가정합니다.

- Hosting을 쓰더라도 정적 배포만 전제합니다.
- Firestore, Storage, Auth는 MVP에서 사용하지 않습니다.
- Cloud Billing 또는 Blaze 플랜 연결이 필수인 구조를 만들지 않았습니다.
- Gemini Developer API free tier 한도에 도달하거나 호출이 실패하면 Mock 분석 결과로 대체합니다.

## Firebase AI Logic / Gemini 설정

`src/app.js`는 Firebase 설정 파일이 있을 때만 Firebase AI Logic Web SDK를 동적으로 불러옵니다. 설정이 없거나 호출에 실패하면 앱은 멈추지 않고 Mock 모드로 계속 실행됩니다.

1. Firebase Console에서 프로젝트를 만들고 웹 앱 config 값을 복사합니다.
2. Firebase Console의 AI Services 또는 AI Logic 설정에서 Gemini Developer API provider를 준비합니다.
3. `src/firebaseConfig.example.js`를 `src/firebaseConfig.js`로 복사합니다.
4. `src/firebaseConfig.js`에 본인의 Firebase 설정값을 입력합니다.
5. 필요하면 `src/app.js` 상단의 `MODEL_NAME` 값을 현재 지원되는 경량 텍스트 모델명으로 바꿉니다.
6. 브라우저에서 앱을 열고 피드백을 입력한 뒤 `저장하고 분석` 또는 `선택 피드백 분석`을 실행합니다.

```js
// src/firebaseConfig.js 예시
// 실제 값을 공개 저장소에 커밋하지 마세요.
export const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_WEB_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_FIREBASE_APP_ID",
};
```

주의: 실제 API 키나 Firebase 설정값을 공개 GitHub 저장소에 직접 올리지 마세요. `src/firebaseConfig.js`, 루트의 `firebaseConfig.js`, `.env`, `.env.*`는 `.gitignore`에 포함되어 있습니다. 예시 파일인 `src/firebaseConfig.example.js`만 저장소에 포함합니다.

## Gemini 분석 실패: Firebase API 키가 유효하지 않습니다

이 오류는 `src/firebaseConfig.js` 파일이 없다는 뜻은 아닐 수 있습니다. 파일이 정상 로드되어도 Firebase 웹앱 config와 AI Logic / Gemini provider 설정이 맞지 않으면 실제 Gemini 호출이 실패하고 앱은 Mock 분석으로 대체됩니다.

가능한 원인:

1. `src/firebaseConfig.js`에 Firebase Console의 web config가 정확히 들어가지 않음
2. 다른 Firebase 프로젝트의 config를 붙여넣음
3. Firebase Console에서 등록한 웹앱의 config가 아니라 다른 키를 사용함
4. Firebase AI Logic에서 Gemini Developer API provider 설정을 완료하지 않음
5. 설정 직후 백엔드 반영이 아직 안 됨
6. Google Cloud Console에서 해당 API key가 삭제되었거나 제한 설정이 맞지 않음

해결 순서:

1. Firebase Console → Project settings → General → Your apps로 이동
2. 현재 웹앱의 SDK setup config를 다시 복사
3. `src/firebaseConfig.js`의 `firebaseConfig` 객체를 교체
4. Firebase Console → AI Logic에서 Gemini Developer API provider 설정 완료 여부 확인
5. 몇 분 기다린 뒤 로컬 서버 새로고침
6. 다시 피드백 분석 실행

중요:

- Gemini API key를 직접 `src/firebaseConfig.js`에 넣지 마세요.
- `src/firebaseConfig.js`는 GitHub에 커밋하지 마세요.
- 공개 배포에서 실제 AI 연결을 켤 경우 App Check 등 보호 설정을 검토하세요.

## localStorage 주의사항

현재 데이터는 서버 DB가 아니라 브라우저 `localStorage`에 저장됩니다.

- 같은 컴퓨터라도 브라우저를 바꾸면 데이터가 보이지 않을 수 있습니다.
- 다른 기기와 자동 동기화되지 않습니다.
- 브라우저 캐시나 사이트 데이터를 삭제하면 기록이 사라질 수 있습니다.
- 중요한 작업 기록은 Settings의 `JSON 백업`으로 저장하세요.
- 백업 파일은 Settings의 `백업 불러오기`로 다시 복원할 수 있습니다.

## JSON 백업 방법

Settings View의 `JSON 백업` 버튼을 누르면 현재 프로젝트, 피드백, 분석 결과, 작업 카드가 하나의 JSON 파일로 저장됩니다.

복원할 때는 `백업 불러오기`를 누르고 이전에 내보낸 백업 파일을 선택합니다. 다른 앱에서 만든 JSON이나 구조가 깨진 파일은 불러올 수 없습니다.

Landing Page의 시작 방식 선택에서 `백업 불러오기`를 고르면 앱이 Settings View로 이동하고 백업 영역을 강조합니다.

## GitHub에 올릴 핵심 파일

이 프로젝트는 HTML/CSS/JavaScript 기반 정적 웹앱입니다. 최소 업로드 파일은 다음과 같습니다.

- `index.html`
- `src/app.js`
- `src/styles.css`
- `src/firebaseConfig.example.js`
- `README.md`
- `.gitignore`

다음 파일은 이전 Flutter/LossLens 프로젝트 잔여물이므로 `studio-critic-ai` 배포에는 필요하지 않습니다.

- `pubspec.yaml`
- `pubspec.lock`
- `analysis_options.yaml`
- `android/`
- `ios/`
- `lib/`
- `windows/`
- `server/`
- `docs/`
- `installer/`
- `tool/`
- `assets/branding/`

`.gitignore`는 이 잔여 파일들이 새로 추가되는 것을 막도록 보강되어 있습니다. 다만 이미 Git이 추적 중인 파일은 `.gitignore`만으로 커밋 대상에서 빠지지 않습니다. GitHub Desktop에 올리기 전 변경 파일 목록에서 위 잔여 파일이 포함되어 있지 않은지 확인하세요.

GitHub Pages 배포 전에는 실제 API 키가 포함된 `src/firebaseConfig.js`가 커밋되지 않았는지 반드시 확인하세요.

## 실행 방법

별도 빌드 과정은 필요 없습니다. 정적 파일 서버만 실행하면 됩니다.

```bash
python -m http.server 4173
```

브라우저에서 다음 주소를 엽니다.

```text
http://localhost:4173
```

Python 실행 파일명이 `python3`인 환경에서는 다음 명령을 사용합니다.

```bash
python3 -m http.server 4173
```

Windows에서 `python` 또는 `python3` 명령이 인식되지 않으면 Python을 설치하거나, 같은 폴더를 서비스할 수 있는 다른 정적 파일 서버를 사용해도 됩니다.

## 배포 방법

### GitHub Pages

1. GitHub 저장소의 Settings > Pages로 이동합니다.
2. Source를 현재 브랜치의 루트 폴더로 설정합니다.
3. 배포 후 `index.html`이 진입점으로 사용됩니다.

공개 저장소에 올리기 전 `src/firebaseConfig.js`, `.env`, `.env.*`, 실제 API 키가 포함된 파일이 커밋 대상에 들어가지 않았는지 확인하세요.

GitHub Pages에서는 다음 hash URL을 직접 열거나 새로고침해도 `index.html` 안에서 안전하게 처리됩니다.

```text
#/landing
#/start
#/app/home
#/app/feedback
#/app/analysis
#/app/tasks
#/app/critic-prep
#/app/portfolio
#/app/settings
```

공개 데모 배포에서는 `src/firebaseConfig.js`를 올리지 않아도 됩니다. 이 경우 상단 상태는 `Demo Mode · Firebase 없이 로컬 체험 중`으로 표시되고, 분석은 Mock 결과로 생성됩니다.

### Firebase Hosting

Firebase Hosting을 쓰는 경우에도 정적 파일만 배포합니다.

```bash
firebase init hosting
firebase deploy --only hosting
```

루트 배포를 선택하거나, 필요하면 `index.html`과 `src/`를 hosting public 폴더로 복사하세요.

## 향후 확장 계획

- Firestore 저장
- 로그인
- PDF 분석
- 음성 입력
- 이미지 기반 패널 피드백
- 팀 작업 기능

## 테스트

```bash
node --check src/app.js
git diff --check
git check-ignore -v src/firebaseConfig.js firebaseConfig.js .env .env.local
python -m http.server 4173
```

브라우저 확인 주소:

```text
http://localhost:4173
```

라우팅 확인 예:

```text
http://localhost:4173/#/landing
http://localhost:4173/#/start
http://localhost:4173/#/app/tasks
```
