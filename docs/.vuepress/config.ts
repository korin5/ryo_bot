import { defineUserConfig } from 'vuepress'
import { defaultTheme } from 'vuepress'

export default defineUserConfig({
  title: 'ryo_bot',
  description: '基于ICQQ开发的QQ机器人，这里是说明文档',
  base: '/ryo_bot/',
  head: [['link', { rel: 'icon', href: '/images/logo.png' }]],
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
  },
  theme: defaultTheme({
    locales: {
      '/': {
        selectLanguageName: '简体中文',
        editLinkText: '在 GitHub 上编辑此页',
        navbar: [
          { text: '自我介绍', link: '/intro' },
          { text: '用户文档', link: '/use' },
          { text: '开发文档', link: '/develop' },
        ]
      },
      '/en/': {
        selectLanguageName: 'English',
        navbar: [
          { text: 'Introduction', link: '/en/intro' },
          { text: 'User Manual', link: '/en/use' },
          { text: 'Develop Doc', link: '/en/develop' },
        ]
      },
      '/ja/': {
        selectLanguageName: '日本語',
        navbar: [
          { text: '自己紹介', link: '/ja/intro' },
          { text: '使用方法', link: '/ja/use' },
          { text: 'かいはつ', link: '/ja/develop' },
        ]
      },
      repo: 'korin5/ryo_bot',
      sidebar: 'auto',
      smoothScroll: true
    },
    repo: 'korin5/ryo_bot',
    docsRepo: 'https://github.com/korin5/ryo_bot',
    docsBranch: 'dev',
    docsDir: 'docs',
    editLinkPattern: ':repo/edit/:branch/:path',
  })
})
