# ec-canvas 图表组件使用说明

## echarts.min.js 文件获取

由于 echarts 库文件较大，无法直接包含在代码中，需要手动下载：

### 方式一：从 GitHub 下载（推荐）

1. 访问 echarts-for-weixin 仓库：
   https://github.com/ecomfe/echarts-for-weixin

2. 下载项目或找到 `ec-canvas` 目录下的 `echarts.min.js` 文件

3. 将下载的 `echarts.min.js` 文件放到本目录下：
   `components/ec-canvas/echarts.min.js`

### 方式二：使用 CDN 下载

访问以下链接直接下载：
https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js

将下载的内容保存到：
`components/ec-canvas/echarts.min.js`

## 使用示例

### 在页面中使用

1. 在页面的 json 文件中注册组件：

```json
{
  "usingComponents": {
    "ec-canvas": "/components/ec-canvas/ec-canvas"
  }
}
```

2. 在 wxml 中使用组件：

```html
<ec-canvas id="mychart-dom-bar" canvas-id="mychart-bar" ec="{{ ec }}"></ec-canvas>
```

3. 在 js 中初始化图表：

```javascript
import * as echarts from '../../components/ec-canvas/echarts.min';

function initChart(canvas, width, height, dpr) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr
  });

  const option = {
    // 配置项
  };

  chart.setOption(option);
  return chart;
}

Page({
  data: {
    ec: {
      onInit: initChart
    }
  }
});
```

## 注意事项

1. 确保 `echarts.min.js` 文件已正确下载并放置在正确位置
2. 微信基础库版本需 >= 1.9.91
3. 建议微信基础库版本 >= 2.9.0，使用新版 Canvas API，性能更好
