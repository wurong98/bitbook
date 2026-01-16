import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "books",
  
  title: "bitbook",
  description: "比特币快速入门指南",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/Bitcoin.svg',
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/00-前言' }
    ],

    sidebar: [
      {
        text: '比特币快速入门',
        items: [
          { text: '前言', link: '/00-前言' },
          { text: '什么是比特币', link: '/01-what-is-bitcoin' },
          { text: 'UTXO模型', link: '/02-utxo-model' },
          { text: 'Keys和Address概念', link: '/03-keys-addresses' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/wurong98/bitbook' }
    ]
  }
})
