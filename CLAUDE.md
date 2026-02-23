# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Communication Rules (重要 - 必须遵守)

1. **用中文与用户沟通**：所有回复、解释、问题都必须使用中文
2. **Git提交规则**：每次修改代码或文档前，必须先提交git仓库，以留存记录方便回滚
   - 修改前先提交，确保有可回滚的快照
   - 提交信息应清晰描述修改内容

## Project Overview

SnapBill (秒拍帐) is a WeChat Mini Program for AI-powered expense tracking. It automatically recognizes payment screenshots, supports multi-user shared ledgers, and provides minimalist bookkeeping for groups like couples and roommates.

## Development Commands

### Linting
```bash
# Run ESLint (configured for WeChat Mini Program)
eslint --ext .js .
```

### Build & Run
- Use WeChat Developer Tools for development, building, and deployment
- Project uses Skyline renderer (advanced WeChat rendering engine)
- ES6 transpilation and WXML minification enabled

## Architecture

### Framework Stack
- **Platform**: WeChat Mini Program (原生开发)
- **Renderer**: Skyline (next-gen rendering engine)
- **Component Framework**: glass-easel
- **Styling**: WXSS (WeChat Style Sheets)
- **Language**: JavaScript (ES6+)

### Directory Structure
```
├── app.js              # Main app entry point
├── app.json            # App config: pages, window settings, renderer
├── components/         # Reusable components
│   └── navigation-bar/ # Custom navigation bar (replaces default)
└── pages/              # Application pages
    └── index/          # Currently only index page
```

### Key Configuration

**app.json** defines:
- Single page structure (index)
- Custom navigation style (`navigationStyle: "custom"`)
- Skyline renderer with defaultDisplayBlock, defaultContentBox
- Lazy code loading enabled

**project.config.json** contains:
- AppID: wx571840df07865ce1
- ES6 transpilation, PostCSS, WXML minification enabled

### Custom Navigation Bar Component

The `navigation-bar` component (components/navigation-bar/) replaces WeChat's default navigation bar. Key features:
- **Safe area handling**: Automatically handles iOS/Android status bar and menu button positioning via `wx.getMenuButtonBoundingClientRect()` and `wx.getSystemInfoSync()`
- **Properties**: title, background, color, back button toggle, loading indicator, home button
- **Multi-slot support**: Enabled via `multipleSlots: true` option
- **Animation**: Optional opacity transition on show/hide
- **Platform detection**: Distinguishes between iOS, Android, and devtools

When using this component, pages should set `navigationStyle: "custom"` in their JSON config.

## Core Features (from PRD)

### P0 - Core Features (Must Implement)
1. **AI Screenshot Recognition**: Upload/capture payment screenshots, extract amount/time, intelligent category matching
2. **Single-user Bookkeeping**: Basic expense tracking with confirmation flow
3. **Ledger Management**: Create and manage ledgers, basic statistics
4. **WeChat Authorization**: Login via WeChat account (no separate registration)

### P1 - Fast Iteration Features
1. **Multi-user Shared Ledgers**: Invitation codes/links, member management, automatic payer identification
2. **Custom Categories**: Add/edit/delete expense categories
3. **History Search**: Filter by date, payer, category; keyword search
4. **Data Export**: Export to Excel (ledger owner only)

### P2 - Optional Features
1. **Reminder Notifications**: Daily reminders for bookkeeping
2. **Data Import**: Import from Excel
3. **Chart Optimization**: Enhanced visualization
4. **Personalization**: Custom ledger covers/colors

## Technical Constraints

### AI Integration
- Uses Tencent Cloud Hunyuan-VL model for payment screenshot recognition
- Extracts: payment amount, time, merchant name
- Target accuracy: ≥95% on mainstream payment screenshots

### Data Storage
- WeChat Mini Program Cloud Development Database
- Stores: user data, ledgers, records, screenshot thumbnails (not original images)
- Screenshot recognition extracts only booking info, no privacy leakage

### Security
- WeChat account authorization for login
- Only ledger members can access corresponding data
- Privacy protection for screenshot content

### Interaction Principles
- Minimal 3-step core flow: Screenshot → Upload → Confirm
- Reduce page jumps, timely feedback
- Clean, minimalist UI matching WeChat mini program conventions

## User Flow Examples

### Bookkeeping Flow
Home → Tap "+记账" → Choose "Upload Screenshot"/"Take Photo" → Auto-recognize → Preview (amount/time/category) → Confirm → Home with "记账成功" toast

### Multi-user Sharing Flow
Ledger details → Tap "共享账本" → Generate invite code/link → Share via WeChat → Recipient joins → Auto-join with WeChat identity

## Notes

- Supports WeChat Pay and Alipay screenshot formats primarily
- When implementing multi-user features, ensure payer identification accuracy to avoid data confusion
- Keep operations simple - avoid redundant features that conflict with "lazy bookkeeping" core philosophy
