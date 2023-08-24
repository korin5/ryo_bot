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
          {
            text: 'Language',
            ariaLabel: 'Language Menu',
            items: [
              { text: '简体中文', link: '/' },
              { text: 'English', link: '/en/' },
              { text: '日本語', link: '/ja/' }
            ]
          },
        ],
        repo: 'korin5/ryo_bot',
        sidebar: 'auto',
        smoothScroll: true
      },
      '/en/': {
        nav: [
          { text: 'To Use', link: '/use' },
          { text: 'Develop', link: '/develop' },
          {
            text: 'Language',
            ariaLabel: 'Language Menu',
            items: [
              { text: '简体中文', link: '/' },
              { text: 'English', link: '/en/' },
              { text: '日本語', link: '/ja/' }
            ]
          },
        ],
        repo: 'korin5/ryo_bot',
        sidebar: 'auto',
        smoothScroll: true
      },
      '/ja/': {
        nav: [
          { text: '使用方法', link: '/use' },
          { text: 'かいはつ', link: '/develop' },
          {
            text: 'Language',
            ariaLabel: 'Language Menu',
            items: [
              { text: '简体中文', link: '/' },
              { text: 'English', link: '/en/' },
              { text: '日本語', link: '/ja/' }
            ]
          },
        ],
        repo: 'korin5/ryo_bot',
        sidebar: 'auto',
        smoothScroll: true
      }
    },

  },



  // locales: {
  //   // 键名是该语言所属的子路径
  //   // 作为特例，默认语言可以使用 '/' 作为其路径。
  //   '/': {
  //     lang: 'zh-CN', // 将会被设置为 <html> 的 lang 属性
  //     title: 'VuePress',
  //     description: '驱动的静态网站生成器'
  //   },
  //   '/en/': {
  //     lang: 'en-US',
  //     title: 'VuePress',
  //     description: 'Vue-powered Static Site GeneratorVue'
  //   },
  //   '/ja/': {
  //     lang: 'ja-JP',
  //     title: 'VuePress',
  //     description: 'Vue-powered Static Site GeneratorVue'
  //   }
  // }
}
