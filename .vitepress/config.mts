import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "books",
  
  title: "bitbook",
  description: "比特币快速入门指南",
  head: [ // /ico.png  网站图标
    ['link', { rel: 'icon', type: 'image/png', href: '/logo.png' }]
  ],
  themeConfig: {
    logo: '/logo.png',
  
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
          { text: 'Keys和Address概念', link: '/03-keys-addresses' },
          { text: '交易基础', link: '/04-transactions-basics' },
          { text: '哈希函数', link: '/05-hash-functions' },
          { text: 'SHA256详解', link: '/06-sha256-details' },
          { text: 'ECDSA签名', link: '/07-ecdsa-signature' },
          { text: '默克尔树', link: '/08-merkle-tree' },
          { text: '交易格式', link: '/09-transaction-format' },
          { text: '交易构造', link: '/10-constructing-tx' },
          { text: '签名机制', link: '/11-signing-mechanism' },
          { text: '交易验证', link: '/12-validating-tx' },
          { text: '费用计算', link: '/13-fee-calculation' },
          { text: 'P2P网络', link: '/14-p2p-network' },
          { text: 'Mempool', link: '/15-mempool' },
          { text: '挖矿过程', link: '/16-mining-process' },
          { text: 'PoW验证', link: '/17-pow-verification' },
          { text: '共识规则', link: '/18-consensus-rules' },
          { text: '钱包类型', link: '/19-wallet-types' },
          { text: 'HD钱包', link: '/20-hd-wallet' },
          { text: '脚本系统', link: '/21-script-system' },
          { text: 'SegWit和Taproot', link: '/22-segwit-taproot' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/wurong98/bitbook' }
    ]
  }
})
