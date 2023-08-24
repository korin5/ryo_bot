module.exports = {
  title: 'ryo_bot',
  description: '基于ICQQ开发的QQ机器人，这里是说明文档',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: '使用说明', link: '/use' },
      { text: '开发文档', link: '/develop' },
      // { text: 'External', link: 'https://google.com' },
    ],
    sidebar: [
      '/',
      '/page-a',
      ['/page-b', 'Explicit link text']
    ],
    repo: 'korin5/ryo_bot',
  }
}
