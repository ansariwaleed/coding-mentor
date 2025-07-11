const platformConfigs = {
  'leetcode.com': {
    selector: '.description__24sA, .content__1Y2H',
    extract: (element) => element.innerText.trim()
  },
  'hackerrank.com': {
    selector: '.challengecard-title, .problem-statement',
    extract: (element) => element.innerText.trim()
  },
  'checkio.org': {
    selector: '.mission-text, .task-description',
    extract: (element) => element.innerText.trim()
  },
  'codeforces.com': {
    selector: '.problem-statement',
    extract: (element) => element.innerText.trim()
  },
  'codewars.com': {
    selector: '.markdown',
    extract: (element) => element.innerText.trim()
  },
  'codingame.com': {
    selector: '.statement-body',
    extract: (element) => element.innerText.trim()
  },
  'default': {
    selector: 'h1, h2, .problem, .description, [class*="statement"], [class*="question"]',
    extract: (element) => element.innerText.trim()
  }
};

function getPlatformConfig() {
  const hostname = window.location.hostname;
  for (const platform in platformConfigs) {
    if (hostname.includes(platform)) {
      return platformConfigs[platform];
    }
  }
  return platformConfigs['default'];
}