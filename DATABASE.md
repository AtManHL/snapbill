# 数据库结构设计

本文档描述了秒拍帐小程序的数据库集合结构。

## 数据库集合列表

| 集合名 | 说明 | 权限 |
|--------|------|------|
| `users` | 用户表 | 仅创建者可读写 |
| `ledgers` | 账本表 | 仅创建者可读写 |
| `ledgerMembers` | 账本成员关系表 | 仅创建者可读写 |
| `records` | 记账记录表 | 仅创建者可读写 |
| `categories` | 分类表 | 所有用户可读，管理员可写 |

---

## 1. users 集合

用户基本信息表。

### 数据结构

```javascript
{
  _id: string,              // 用户ID
  _openid: string,          // 微信openid（系统字段）
  nickName: string,         // 用户昵称
  avatarUrl: string,        // 用户头像URL
  currentLedgerId: string,  // 当前选中的账本ID
  remark: string,           // 个人备注（可选）
  createTime: Date,         // 创建时间
  updateTime: Date,         // 更新时间
}
```

### 索引
- `_openid`（唯一）

---

## 2. ledgers 集合

账本信息表。

### 数据结构

```javascript
{
  _id: string,              // 账本ID
  name: string,             // 账本名称
  description: string,      // 账本描述（可选）
  ownerId: string,          // 创建者openid
  isDefault: boolean,       // 是否为默认账本
  isDeleted: boolean,       // 是否已删除（软删除）
  inviteCode: string,       // 邀请码
  createTime: Date,         // 创建时间
  updateTime: Date,         // 更新时间
}
```

### 索引
- `ownerId`
- `inviteCode`（唯一）
- `isDeleted`

---

## 3. ledgerMembers 集合

账本与用户的关联表，支持多人共享账本。

### 数据结构

```javascript
{
  _id: string,              // 关系ID
  ledgerId: string,         // 账本ID
  userId: string,           // 用户openid
  userName: string,         // 用户昵称（冗余存储，避免关联查询）
  role: string,             // 角色：owner(创建者) | member(成员)
  joinTime: Date,           // 加入时间
}
```

### 索引
- `ledgerId`
- `userId`
- `ledgerId + userId`（复合唯一索引）

---

## 4. records 集合

记账记录表。

### 数据结构

```javascript
{
  _id: string,              // 记录ID
  ledgerId: string,         // 所属账本ID
  amount: number,           // 金额（元）
  amountInCents: number,    // 金额（分）
  categoryId: string,       // 分类ID
  categoryName: string,     // 分类名称
  paymentTime: Date,        // 支付时间
  payerId: string,          // 支付人openid
  payerName: string,        // 支付人名称
  merchantName: string,     // 商户名称（可选）
  remark: string,           // 备注（可选）
  isAIEstimated: boolean,   // 是否为AI估算
  originalImageUrl: string, // 原始图片URL（可选）
  thumbnailUrl: string,     // 缩略图URL（可选）
  createTime: Date,         // 创建时间
  updateTime: Date,         // 更新时间
}
```

### 索引
- `ledgerId`
- `payerId`
- `paymentTime`
- `ledgerId + paymentTime`（复合索引）
- `categoryId`

---

## 5. categories 集合

分类表，支持默认分类和自定义分类。

### 数据结构

```javascript
{
  _id: string,              // 分类ID
  name: string,             // 分类名称
  icon: string,             // 图标（emoji或URL）
  color: string,            // 颜色（十六进制）
  sort: number,             // 排序序号
  isDefault: boolean,       // 是否为默认分类
  isDeleted: boolean,       // 是否已删除
  ledgerId: string,         // 所属账本ID（自定义分类时填写）
  createTime: Date,         // 创建时间
  updateTime: Date,         // 更新时间
}
```

### 索引
- `isDefault`
- `sort`
- `ledgerId`

### 默认分类数据

| 名称 | 图标 | 颜色 |
|------|------|------|
| 餐饮美食 | 🍽 | #FF6B6B |
| 日常购物 | 🛒 | #4ECDC4 |
| 交通出行 | 🚗 | #45B7D1 |
| 居家住房 | 🏠 | #96CEB4 |
| 健康医疗 | 🏥 | #FFEAA7 |
| 休闲娱乐 | 🎬 | #DDA0DD |
| 学习成长 | 📚 | #98D8C8 |
| 人情往来 | 💝 | #F7DC6F |
| 通讯数码 | 📱 | #BB8FCE |
| 其他支出 | 💰 | #95A5A6 |

---

## 云函数接口

### login
- **用途**: 用户登录/注册
- **输入**: `nickName`, `avatarUrl`
- **输出**: `openid`, `userId`, `nickName`, `avatarUrl`, `isNewUser`, `currentLedgerId`

### ledger
- **create**: 创建账本
- **update**: 更新账本信息
- **delete**: 删除账本（软删除）
- **list**: 获取账本列表（带成员数和总支出）
- **get**: 获取单个账本
- **switch**: 切换当前账本
- **getMembers**: 获取账本成员列表
- **generateInviteCode**: 生成邀请码
- **joinByInviteCode**: 通过邀请码加入账本

### record
- **add**: 添加记录
- **update**: 更新记录
- **delete**: 删除记录
- **get**: 获取单条记录
- **list**: 查询记录列表
- **search**: 搜索记录

### statistics
- **byCategory**: 按分类统计
- **byDate**: 按日期统计
- **byUser**: 按用户统计（成员统计）
- **summary**: 统计汇总

### ai-recognize
- **用途**: AI识别支付截图
- **输入**: `imageUrl`
- **输出**: `amount`, `paymentTime`, `merchantName`, `categoryName`

### init
- **用途**: 初始化数据
- **categories**: 初始化默认分类

---

## 数据关系图

```
users (1)
  │
  ├─── currentLedgerId ───┐
  │                        │
  └─── ledgerMembers (N) ──┤
                           │
ledgers (1)                │
  │                        │
  ├─── inviteCode          │
  ├─── ledgerMembers (N) ──┘
  │       ├── userId → users._openid
  │       └── ledgerId → ledgers._id
  │
  └─── records (N)
          ├── ledgerId → ledgers._id
          ├── payerId → users._openid
          └── categoryId → categories._id
```

---

## 注意事项

1. **权限控制**: 所有集合使用"仅创建者可读写"权限，通过云函数进行跨用户数据访问控制
2. **软删除**: ledgers 和 categories 使用 `isDeleted` 字段实现软删除
3. **时间字段**: 所有集合都包含 `createTime` 和 `updateTime` 字段
4. **OpenID**: 使用微信云开发的 `_openid` 系统字段关联用户
5. **图片存储**: 图片存储在云存储中，records 表中保存 fileID
