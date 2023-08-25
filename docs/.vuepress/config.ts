module.exports = {
  title: 'ryo_bot',
  description: '基于ICQQ开发的QQ机器人，这里是说明文档',
  base: '/ryo_bot/',
  themeConfig: {
    locales: {
      '/': {
        nav: [
          { text: '使用说明', link: '/use' },
          { text: '开发文档', link: '/develop' },
        ],
        repo: 'korin5/ryo_bot',
        sidebar: 'auto',
        smoothScroll: true
      },
      '/en/': {
        nav: [
          { text: 'How To Use', link: '/en/use' },
          { text: 'Develop', link: '/en/develop' },
        ],
        repo: 'korin5/ryo_bot',
        sidebar: 'auto',
        smoothScroll: true
      },
      '/ja/': {
        nav: [
          { text: '使用方法', link: '/ja/use' },
          { text: 'かいはつ', link: '/ja/develop' },
        ],
        repo: 'korin5/ryo_bot',
        sidebar: 'auto',
        smoothScroll: true
      }
    },
    repo: 'korin5/ryo_bot',
    // repoLabel: 'GitHub',
  },



  locales: {
    '/': {
      lang: 'zh-CN',
    },
    '/en/': {
      lang: 'en-US',
    },
    '/ja/': {
      lang: 'ja-JP',
    }
  }
}
