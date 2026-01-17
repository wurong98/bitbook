# SegWit 与 Taproot

## 目录

1. [SegWit 概述](#segwit-概述)
2. [SegWit 技术细节](#segwit-技术细节)
3. [地址格式](#地址格式)
4. [Taproot 升级](#taproot-升级)
5. [Schnorr 签名](#schnorr-签名)
6. [实际应用](#实际应用)
7. [常见问题](#常见问题)

---

## SegWit 概述

### 什么是 SegWit

```
SegWit = Segregated Witness（隔离见证）

核心概念：
  将签名数据（见证数据）与交易数据分离
  见证数据不计入交易 ID 计算
  实现软分叉升级

推出时间：
  2017 年 8 月激活（Bitcoin Core 0.13.0）

问题解决：
  交易可塑性（Transaction Malleability）
  闪电网络支持
  交易大小优化
```

### 主要优势

```
1. 交易可塑性修复
   TXID 不依赖见证数据
   见证数据修改不改变 TXID

2. 块大小扩展
   隐性增大块大小限制
   有效块大小 ≈ 4 MB（理论）

3. 费用优化
   交易更小（不包括见证）
   25-30% 的大小减少

4. 脚本新功能
   支持更复杂的脚本
   未来升级更容易

5. 闪电网络基础
   时间锁合约需要 SegWit
```

---

## SegWit 技术细节

### 交易结构变化

```
传统交易格式：
  [版本][输入数量]
  [每个输入：前一 TXID、前一输出索引、scriptSig 长度、scriptSig、序列号]
  [输出数量]
  [每个输出：金额、scriptPubKey 长度、scriptPubKey]
  [锁定时间]

SegWit 交易格式：
  [版本][marker][flag]           ← 新增：0x00 0x01 表示 SegWit 交易
  [输入数量]
  [每个输入：前一 TXID、前一输出索引、scriptSig 长度、scriptSig、序列号]
  [输出数量]
  [每个输出：金额、scriptPubKey 长度、scriptPubKey]
  [见证数据]                       ← 新增：分离的签名数据
  [锁定时间]

关键点：
  marker = 0x00，flag = 0x01 标识 SegWit
  旧节点忽略见证数据（解析为 0 个输入）
  新节点正确识别并验证
```

### 块大小计算

```
SegWit 中的"权重"概念：

权重 = 基础字节 × 3 + 见证字节 × 1

总权重 ≤ 4,000,000 权重单位（WU）

换算为字节：
  基础交易（无见证）：传统字节数
  有见证交易：字节数 < 传统格式

例：
  传统 P2PKH 交易：250 字节
  SegWit P2WPKH 交易：≈170 字节（32% 减少）

块大小变化：
  传统块：≤ 1 MB
  SegWit 块：≤ 1 MB 基础 + 最多 3 MB 见证 = ≈4 MB
```

### P2WPKH（Pay to Witness Public Key Hash）

```
SegWit v0 标准地址格式

scriptPubKey：
  OP_0 <20 字节公钥哈希>

scriptSig：
  空（见证数据在 witness 字段）

见证字段：
  [签名, 公钥]

地址格式：
  bc1... (Bech32 编码)

优势：
  字节小
  费用低
  可直接从公钥哈希生成
```

### P2WSH（Pay to Witness Script Hash）

```
SegWit v0 脚本地址格式

scriptPubKey：
  OP_0 <32 字节脚本哈希>

scriptSig：
  空

见证字段：
  [数据..., 脚本]

用途：
  多重签名
  复杂条件
  时间锁定合约

例：多重签名见证
  见证字段包含：
    - 所有必要的签名
    - 完整的 multisig 脚本

地址格式：
  bc1... (Bech32 编码)
```

---

## 地址格式

### Bech32 编码

```
格式：
  hrp + "1" + data

hrp = Human Readable Part：
  bc = Bitcoin 主网
  tb = Bitcoin 测试网

例：
  bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4

解析：
  bc = Bitcoin 主网
  1 = 分隔符
  qw508d6q... = 数据部分（Base32 编码）

特点：
  大小写不敏感
  可检测拼写错误（校验和）
  更易识别（易读部分明确）
```

### 地址类型对比

```
传统 P2PKH：
  格式：1... (Base58Check)
  脚本大小：25 字节
  费用：相对高

传统 P2SH：
  格式：3... (Base58Check)
  脚本大小：23 字节
  费用：相对中等

SegWit P2WPKH：
  格式：bc1q... (Bech32)
  脚本大小：22 字节
  费用：最低
  推荐：✓ 最佳选择

SegWit P2WSH：
  格式：bc1q... (Bech32)
  脚本大小：34 字节
  费用：低（脚本哈希）
  推荐：✓ 复杂脚本用

Taproot P2TR：
  格式：bc1p... (Bech32m)
  脚本大小：34 字节
  费用：极低
  推荐：✓ 未来标准
```

---

## Taproot 升级

### Taproot 概述

```
Taproot = 根部（树根形象）

激活时间：
  2021 年 11 月（Bitcoin Core 0.21.1）

核心改进：
  更简洁的多重签名
  更灵活的脚本
  更强的隐私性
  更小的交易大小

技术基础：
  Schnorr 签名
  Merkle 分支树
  密钥路径花费
```

### 脚本树概念

```
Taproot 允许多个花费路径：

路径 1（密钥路径）：
  单一签名：最简单、最优化

路径 2（脚本路径）：
  在 Merkle 树中选择某个脚本
  更复杂的条件

结构：
  主公钥（聚合所有路径）
  ├── 脚本 A 的 Merkle 路径
  ├── 脚本 B 的 Merkle 路径
  └── 脚本 C 的 Merkle 路径

优势：
  默认路径（单签）最优化
  备选路径（脚本）隐藏
  外界无法区分哪种方式花费
  提高隐私性
```

### P2TR（Pay to Taproot）

```
Taproot 的原生地址格式

scriptPubKey：
  OP_1 <32 字节 Taproot 输出密钥>

地址格式：
  bc1p... (Bech32m 编码)

特点：
  p = OP_1（与 v0 的 OP_0 不同）
  32 字节密钥包含路径信息
  最小的脚本

花费方式（二选一）：

1. 密钥路径花费（最常见）：
   见证字段：[64 字节 Schnorr 签名]

2. 脚本路径花费：
   见证字段：[Schnorr 签名, 脚本, Merkle 证明]
```

### 脚本改进

```
Taproot Script（OP 4）：

支持新操作码：
  OP_CHECKSIGADD：聚合多个签名检查
  
操作码重新启用：
  OP_CAT、OP_SUBSTR、OP_LEFT、OP_RIGHT
  （在 Taproot 中恢复使用）

合约能力增强：
  更灵活的多重签名
  原子交换更简单
  闪电网络改进
```

---

## Schnorr 签名

### Schnorr vs ECDSA

```
ECDSA（传统）：
  签名大小：72 字节（可变，通常）
  签名格式：(r, s) 的 DER 编码
  验证：单个签名单个操作

Schnorr：
  签名大小：64 字节（固定）
  签名格式：r || s（连接）
  验证：支持批量验证

优势：
  1. 更小（64 vs 72 字节）
  2. 线性特性允许签名聚合
  3. 批量验证更快
  4. 无延展性问题
```

### 签名聚合

```
多重签名优化：

传统方式：
  每个签名都要验证
  脚本复杂，字节多
  例：2-of-2 需要 2 个签名

Schnorr 聚合：
  多个 Schnorr 签名可合并为一个
  验证一个聚合签名代替多个验证
  减少字节和计算

公式概念：
  Sig_agg = Sig_1 + Sig_2 + ... + Sig_n

效果：
  2-of-2 多重签名与单签相同大小
  闪电网络通道创建更轻量
```

### 隐私改进

```
Schnorr 带来的隐私增益：

地址重用不可追踪：
  公钥和签名都可批处理
  外观上无法区分聚合 vs 单签

脚本路径隐藏：
  Merkle 树允许备用脚本不可见
  只有使用的路径暴露

隐私示例：
  多重签名与单签看起来一样
  观察者无法区分
  提高链上隐私
```

---

## 实际应用

### 不同场景的选择

```
个人钱包：
  → 使用 P2WPKH 或 P2TR
  → 最小费用
  → 推荐 P2TR（未来标准）

企业多签：
  → 使用 P2WSH（SegWit 多签）或 P2TR 脚本路径
  → 更小的交易
  → 推荐 P2TR

交易所：
  → 可能支持 P2WPKH（接收）和 P2TR（新）
  → 用户存款多样化

闪电网络：
  → 必须支持 SegWit
  → 新通道使用 Taproot
```

### 兼容性现状

```
SegWit 支持情况：

完全支持：
  ✓ Ledger、Trezor、MetaMask
  ✓ Bitcoin Core、Electrum
  ✓ 大多数交易所

部分支持：
  ⚠ 某些旧硬件钱包
  ⚠ 某些交易所不支持接收 SegWit

Taproot 支持情况：

良好支持：
  ✓ Ledger（新款）
  ✓ Trezor（部分）
  ✓ Bitcoin Core（完全）

逐步推广：
  ⏳ 交易所逐步支持
  ⏳ 硬件钱包更新中
```

---

## 常见问题

### Q1: SegWit 是硬分叉还是软分叉？

**A**: 
- 是软分叉（向后兼容）
- 旧节点能处理（认为见证数据为空）
- 新节点正确验证
- 不需要全网升级

### Q2: 使用 SegWit 为什么费用更低？

**A**: 
- 交易大小减少 25-30%
- 费用 = 大小 × 费率
- 更小的大小 = 更低的费用
- SegWit 见证不计入块大小限制

### Q3: 为什么需要 Taproot？

**A**: 
- 进一步优化多重签名
- 改进脚本功能
- 增强隐私性
- 为智能合约预留空间

### Q4: 我的钱包需要升级吗？

**A**: 
- 现有钱包继续工作
- 但推荐升级以获得优势
- SegWit/Taproot 钱包更优化
- 费用和隐私都更好

### Q5: 旧交易所支持接收 P2WPKH 吗？

**A**: 
- 大多数支持（bc1q... 地址）
- 某些旧交易所可能不支持
- 风险很小（地址已充分测试）
- 现代交易所都支持

### Q6: Taproot 如何提高隐私性？

**A**: 
- 多重签名看起来与单签相同
- 脚本路径被 Merkle 树隐藏
- 外界无法区分花费方式
- 减少链上分析可能性
