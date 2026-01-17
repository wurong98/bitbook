# Bitcoin 脚本系统

## 目录

1. [Bitcoin 脚本概述](#bitcoin-脚本概述)
2. [脚本基础](#脚本基础)
3. [操作码](#操作码)
4. [常见脚本类型](#常见脚本类型)
5. [脚本执行](#脚本执行)
6. [脚本验证](#脚本验证)
7. [常见问题](#常见问题)

---

## Bitcoin 脚本概述

### 什么是 Bitcoin 脚本

```
Bitcoin 脚本是一种编程语言：

定位：
  栈式、先进先出（FIFO）的语言
  非图灵完备（无法形成无限循环）
  面向交易验证设计

作用：
  定义如何花费 UTXO
  验证交易的合法性

例：
  scriptPubKey：定义条件
  scriptSig：提供解决方案
```

### 设计原则

```
1. 安全性优先
   防止任意代码执行
   限制操作复杂度

2. 确定性
   任何节点验证结果相同
   无浮动性结果

3. 简洁性
   使用栈式计算
   便于验证

4. 透明性
   所有规则公开
   没有隐藏行为
```

---

## 脚本基础

### 栈式机制

```
工作原理：

操作数入栈：
  OP_1 OP_2 OP_ADD
  
  步骤 1：OP_1 入栈 → 栈：[1]
  步骤 2：OP_2 入栈 → 栈：[1, 2]
  步骤 3：OP_ADD 执行 → 栈：[3]

结果：
  栈顶值为 3

特点：
  LIFO（后进先出）
  操作基于栈顶元素
```

### 脚本组成

```
两部分组成：

scriptPubKey（输出脚本）：
  锁定脚本
  附加在 UTXO 上
  定义如何使用这笔钱

scriptSig（输入脚本）：
  解锁脚本
  提供满足条件的数据
  尝试解锁前面的 UTXO

验证流程：
  scriptSig + scriptPubKey = 有效
  结果栈顶为 true = 花费成功
```

---

## 操作码

### 基础操作码

```
数据操作：

OP_PUSH_DATA：
  将数据推入栈
  例：<signature> <pubkey>

OP_DUP：
  复制栈顶
  栈：[a] → [a, a]

OP_DROP：
  删除栈顶
  栈：[a, b] → [a]

OP_SWAP：
  交换顶部两元素
  栈：[a, b] → [b, a]

OP_OVER：
  复制第二个元素到栈顶
  栈：[a, b] → [a, b, a]
```

### 算术操作码

```
OP_ADD：
  弹出两个数，相加
  栈：[a, b] → [a+b]

OP_SUB：
  栈：[a, b] → [a-b]

OP_MUL：
  栈：[a, b] → [a*b]

OP_DIV：
  栈：[a, b] → [a/b]

OP_MOD：
  栈：[a, b] → [a%b]

OP_EQUAL：
  比较是否相等
  栈：[a, b] → [true/false]

OP_LESSTHAN：
  小于比较
  栈：[a, b] → [a < b]
```

### 密码学操作码

```
OP_HASH160：
  栈：[data] → [RIPEMD160(SHA256(data))]

OP_SHA256：
  栈：[data] → [SHA256(data)]

OP_RIPEMD160：
  栈：[data] → [RIPEMD160(data)]

OP_CHECKSIG：
  验证签名
  栈：[pubkey, sig] → [true/false]
  检查签名是否有效

OP_CHECKSIGVERIFY：
  OP_CHECKSIG + OP_VERIFY
  如果验证失败则终止脚本

OP_CHECKMULTISIG：
  验证多重签名
  栈：[pubkeys..., sigs..., n, m] → [true/false]
```

### 控制流操作码

```
OP_IF：
  条件分支
  栈：[condition] → 根据值选择分支

OP_ELSE：
  与 OP_IF 搭配

OP_ENDIF：
  结束条件

OP_VERIFY：
  验证栈顶值为 true
  不为 true 则脚本失败

OP_RETURN：
  立即脚本失败
```

---

## 常见脚本类型

### P2PKH（Pay to Public Key Hash）

```
最常见的脚本类型

scriptPubKey：
  OP_DUP OP_HASH160 <pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG

scriptSig：
  <signature> <pubkey>

验证过程：

1. scriptSig 入栈
   栈：[signature, pubkey]

2. scriptPubKey 开始执行
   OP_DUP
   栈：[signature, pubkey, pubkey]

3. OP_HASH160
   栈：[signature, pubkey, hash160(pubkey)]

4. <pubKeyHash> 入栈
   栈：[signature, pubkey, hash160(pubkey), targetHash]

5. OP_EQUALVERIFY
   检查哈希相等
   成功则栈：[signature, pubkey]

6. OP_CHECKSIG
   验证签名
   成功则栈：[true]

7. 栈顶为 true，脚本成功
```

### P2SH（Pay to Script Hash）

```
更灵活的脚本类型
允许复杂条件

scriptPubKey：
  OP_HASH160 <scriptHash> OP_EQUAL

scriptSig：
  <data> ... <redeemScript>

特点：
  实际脚本（redeemScript）在解锁时提供
  可以隐藏复杂逻辑

验证：
  1. 检查 redeemScript 的哈希是否匹配
  2. 执行 redeemScript 进行实际验证

用途：
  多重签名
  时间锁定
  条件支付
```

### P2WPKH（Pay to Witness Public Key Hash）

```
SegWit 见证脚本
减少交易大小

scriptPubKey：
  OP_0 <pubKeyHash>

特点：
  使用见证字段而非 scriptSig
  见证数据不计入 TXID 计算
  交易大小减少约 25-30%

优势：
  字节费用降低
  隐私性更好
```

### P2WSH（Pay to Witness Script Hash）

```
P2SH 的 SegWit 版本

scriptPubKey：
  OP_0 <scriptHash>

特点：
  脚本哈希在见证字段中
  支持复杂脚本

用途：
  多重签名的 SegWit 实现
  时间锁定的 SegWit 实现
```

### 多重签名（Multisig）

```
需要多个签名来花费

脚本：
  OP_M <pubkey1> <pubkey2> ... <pubkeyn> OP_N OP_CHECKMULTISIG

M-of-N 签名：
  需要 M 个签名来自 N 个公钥

例：2-of-3
  OP_2 <key1> <key2> <key3> OP_3 OP_CHECKMULTISIG
  
  需要任意 2 个私钥的签名才能花费

scriptSig：
  OP_0 <sig1> <sig2>
  （OP_0 是修复历史 bug 的占位符）

应用：
  共管账户
  冷热钱包分离
  企业管理
```

---

## 脚本执行

### 执行流程

```
验证一个交易的步骤：

1. 遍历所有输入
   对每个输入：

2. 获取对应的输出脚本
   scriptPubKey（锁定脚本）

3. 获取当前输入的脚本
   scriptSig（解锁脚本）

4. 执行 scriptSig
   操作数被推入栈

5. 执行 scriptPubKey
   使用栈中的操作数

6. 检查结果
   栈顶必须为 true
   脚本才能成功

失败条件：
  - 栈为空
  - 栈顶不是 true
  - 脚本出错
  - 操作限制超过
```

### 操作限制

```
防止恶意脚本：

1. 脚本大小
   最大 10,000 字节

2. 栈大小
   最多 1,000 个元素

3. 执行步数
   OP_CHECKMULTISIG 的 n 最多 20

4. 签名数据
   单个签名最多 72 字节

5. 公钥数据
   单个公钥最多 65 字节

设计原因：
  防止 DDoS 攻击
  保证验证速度
```

---

## 脚本验证

### 签名验证过程

```
OP_CHECKSIG 的工作流程：

1. 从栈获取公钥和签名
   pubkey, sig

2. 提取交易的消息哈希
   对当前交易进行 SHA256(SHA256(...))

3. 解析签名
   从 DER 编码中提取 r 和 s 值

4. 验证 ECDSA 签名
   使用公钥、消息哈希、r 和 s
   确认签名有效

5. 返回结果
   签名有效：true
   签名无效：false
```

### 脚本有效性

```
脚本必须满足：

1. 语法正确
   所有操作码有效

2. 操作数充足
   每个操作码有足够操作数

3. 操作结果正确
   数学运算结果正确

4. 栈状态
   最终栈顶为 true

例：
  OP_1 OP_1 OP_ADD
  结果：[2]（true）
  有效

  OP_1 OP_2 OP_EQUAL
  结果：[false]
  无效（1 ≠ 2）
```

---

## 常见问题

### Q1: 为什么 Bitcoin 脚本不是图灵完备的？

**A**: 
- 防止无限循环
- 确保脚本总会终止
- 保证网络安全性
- 避免 DDoS 攻击

### Q2: 能否在脚本中放任意代码？

**A**: 
- 不能，有严格的操作码限制
- OP_CAT、OP_SUBSTR 等已禁用
- 操作复杂度受限
- 确保确定性验证

### Q3: 为什么 multisig 中要有 OP_0？

**A**: 
- 历史原因：OP_CHECKMULTISIG 的 bug
- 消耗一个额外的栈值
- 需要放置 OP_0 作为占位符
- 将来的脚本版本可能修复

### Q4: scriptPubKey 和 scriptSig 的关系？

**A**: 
- scriptPubKey：花费条件（锁）
- scriptSig：满足条件的数据（钥匙）
- 两个脚本顺序执行
- 类似：锁 + 钥匙 = 打开

### Q5: 为什么某些操作码被禁用？

**A**: 
- OP_CAT：可能导致栈溢出
- OP_SUBSTR：操作复杂
- OP_LSHIFT、OP_RSHIFT：性能问题
- 禁用是为了保护网络
