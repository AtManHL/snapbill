import * as echarts from './echarts.min';
import WxCanvas from './wx-canvas';

let ctx;

Component({
  properties: {
    canvasId: {
      type: String,
      value: 'ec-canvas'
    },
    ec: {
      type: Object
    }
  },

  data: {
    isUseNewCanvas: false
  },

  ready: function () {
    if (!this.data.ec) {
      console.warn('组件需绑定 ec 变量，例：<ec-canvas id="mychart-dom-bar" '
        + 'canvas-id="mychart-bar" ec="{{ ec }}"></ec-canvas>');
      return;
    }

    if (!this.data.ec.lazyLoad) {
      this.init();
    }
  },

  methods: {
    init: function (callback) {
      const version = wx.getSystemInfoSync().SDKVersion;

      const canUseNewCanvas = this.compareVersion(version, '2.9.0') >= 0;

      if (canUseNewCanvas) {
        this.setData({ isUseNewCanvas: true });
        this.initByNewWay(callback);
      } else {
        const isValid = this.compareVersion(version, '1.9.91') >= 0;
        if (!isValid) {
          console.error('微信基础库版本过低，需大于等于 1.9.91。'
            + '参见：https://github.com/ecomfe/echarts-for-weixin'
            + '#%E5%BE%AE%E4%BF%A1%E5%9F%BA%E7%A1%80%E5%BA%93%E7%89%88%E6%9C%AC'
          );
          return;
        }
        console.warn('建议将微信基础库调整大于等于 2.9.0 版本。升级后绘图将有更好性能');
        this.initByOldWay(callback);
      }
    },

    initByOldWay: function (callback) {
      ctx = wx.createCanvasContext(this.data.canvasId, this);
      const canvas = new WxCanvas(ctx, this.data.canvasId, false);

      echarts.setCanvasCreator(() => {
        return canvas;
      });

      var query = wx.createSelectorQuery().in(this);
      query.select(`#${this.data.canvasId}`).boundingClientRect(res => {
        if (!res) {
          return;
        }

        this.chart = echarts.init(canvas, null, {
          width: res.width,
          height: res.height
        });

        if (this.data.ec && typeof this.data.ec.onInit === 'function') {
          this.ec.onInit(this.chart, callback);
        } else {
          this.setData({ isUseNewCanvas: false });
        }

        this.canvasToTempFilePath();
      }).exec();
    },

    initByNewWay: function (callback) {
      const query = wx.createSelectorQuery().in(this);
      query.select(`#${this.data.canvasId}`)
        .fields({ node: true, size: true })
        .exec(res => {
          if (!res || !res[0]) {
            return;
          }

          const canvasNode = res[0].node;

          const canvasWidth = res[0].width;
          const canvasHeight = res[0].height;

          const ctx = canvasNode.getContext('2d');

          const dpr = wx.getSystemInfoSync().pixelRatio;
          canvasNode.width = canvasWidth * dpr;
          canvasNode.height = canvasHeight * dpr;
          ctx.scale(dpr, dpr);

          const canvas = new WxCanvas(ctx, this.data.canvasId, true, canvasNode);

          echarts.setCanvasCreator(() => {
            return canvas;
          });

          this.chart = echarts.init(canvas, null, {
            width: res.width,
            height: res.height
          });

          if (this.data.ec && typeof this.data.ec.onInit === 'function') {
            this.ec.onInit(this.chart, callback);
          }

          this.setData({ isUseNewCanvas: true });
        });
    },

    canvasToTempFilePath: function (opt) {
      if (!opt) {
        opt = {};
      }
      this.canvasIdInArgs = opt.canvasId || this.data.canvasId;
      if (!opt.canvasId) {
        opt.canvasId = this.data.canvasId;
      }
      opt.success = (res) => {
        if (this.tempFilePathCallback) {
          this.tempFilePathCallback(res);
        }
      }
      wx.canvasToTempFilePath(opt, this);
    },

    getCanvasId: function () {
      return this.canvasIdInArgs || this.data.canvasId;
    },

    touchStart: function (e) {
      if (this.chart && e.touches.length > 0) {
        var touch = e.touches[0];
        var handler = this.chart.getZr().handler;
        handler.dispatch('mousedown', {
          zrX: touch.x,
          zrY: touch.y,
          preventDefault: () => {},
          stopImmediatePropagation: () => {},
          stopPropagation: () => {}
        });
      }
    },

    touchMove: function (e) {
      if (this.chart && e.touches.length > 0) {
        var touch = e.touches[0];
        var handler = this.chart.getZr().handler;
        handler.dispatch('mousemove', {
          zrX: touch.x,
          zrY: touch.y,
          preventDefault: () => {},
          stopImmediatePropagation: () => {},
          stopPropagation: () => {}
        });
      }
    },

    touchEnd: function (e) {
      if (this.chart) {
        var touch = e.changedTouches[0];
        var handler = this.chart.getZr().handler;
        handler.dispatch('mouseup', {
          zrX: touch.x,
          zrY: touch.y,
          preventDefault: () => {},
          stopImmediatePropagation: () => {},
          stopPropagation: () => {}
        });
        handler.dispatch('click', {
          zrX: touch.x,
          zrY: touch.y,
          preventDefault: () => {},
          stopImmediatePropagation: () => {},
          stopPropagation: () => {}
        });
      }
    },

    compareVersion: function (v1, v2) {
      v1 = v1.split('.');
      v2 = v2.split('.');
      const len = Math.max(v1.length, v2.length);

      while (v1.length < len) {
        v1.push('0');
      }
      while (v2.length < len) {
        v2.push('0');
      }

      for (let i = 0; i < len; i++) {
        const num1 = parseInt(v1[i], 10);
        const num2 = parseInt(v2[i], 10);

        if (num1 > num2) {
          return 1;
        } else if (num1 < num2) {
          return -1;
        }
      }
      return 0;
    }
  }
});
