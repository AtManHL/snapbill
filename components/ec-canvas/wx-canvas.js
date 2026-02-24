export default class WxCanvas {
  constructor(ctx, canvasId, isNew, canvasNode) {
    this.ctx = ctx;
    this.canvasId = canvasId;
    this.chart = null;
    this.isNew = isNew;

    if (isNew) {
      this.canvasNode = canvasNode;
    } else {
      this._initStyle(ctx);
    }

    this._initEvent();
  }

  getContext(contextType) {
    if (contextType === '2d') {
      return this.ctx;
    } else {
      return this.ctx;
    }
  }

  // Canvas context
  setChart(chart) {
    this.chart = chart;
  }

  addEventListener() {}

  removeEventListener() {}

  addEventListener() {}

  // Canvas context
  setChart(chart) {
    this.chart = chart;
  }

  _initStyle(ctx) {
    var styles = ['fillStyle', 'strokeStyle', 'globalAlpha',
      'textAlign', 'textBaseline', 'shadow', 'lineWidth',
      'lineCap', 'lineJoin', 'lineDash', 'miterLimit', 'fontSize'];

    styles.forEach(style => {
      Object.defineProperty(this, style, {
        set: value => {
          ctx[style] = value;
        }
      });
    });

    Object.defineProperty(this, 'setFillStyle', {
      set: value => {
        ctx.fillStyle = value;
      }
    });

    Object.defineProperty(this, 'setStrokeStyle', {
      set: value => {
        ctx.strokeStyle = value;
      }
    });

    Object.defineProperty(this, 'setGlobalAlpha', {
      set: value => {
        ctx.globalAlpha = value;
      }
    });

    Object.defineProperty(this, 'setShadow', {
      set: value => {
        ctx.shadow = value;
      }
    });

    Object.defineProperty(this, 'setLineWidth', {
      set: value => {
        ctx.lineWidth = value;
      }
    });

    Object.defineProperty(this, 'setLineCap', {
      set: value => {
        ctx.lineCap = value;
      }
    });

    Object.defineProperty(this, 'setLineJoin', {
      set: value => {
        ctx.lineJoin = value;
      }
    });

    Object.defineProperty(this, 'setLineDash', {
      set: value => {
        ctx.setLineDash(value);
      }
    });

    Object.defineProperty(this, 'setMiterLimit', {
      set: value => {
        ctx.miterLimit = value;
      }
    });

    Object.defineProperty(this, 'setFontSize', {
      set: value => {
        ctx.font = value + 'px sans-serif';
      }
    });

    Object.defineProperty(this, 'setFont', {
      set: value => {
        ctx.font = value;
      }
    });

    Object.defineProperty(this, 'setTextAlign', {
      set: value => {
        ctx.textAlign = value;
      }
    });

    Object.defineProperty(this, 'setTextBaseline', {
      set: value => {
        ctx.textBaseline = value;
      }
    });

    Object.defineProperty(this, 'strokeRect', {
      value: (x, y, width, height) => {
        ctx.strokeRect(x, y, width, height);
      }
    });

    Object.defineProperty(this, 'fillRect', {
      value: (x, y, width, height) => {
        ctx.fillRect(x, y, width, height);
      }
    });

    Object.defineProperty(this, 'measureText', {
      value: (text) => {
        return ctx.measureText(text);
      }
    });

    Object.defineProperty(this, 'drawImage', {
      value: (...args) => {
        ctx.drawImage(...args);
      }
    });

    Object.defineProperty(this, 'clip', {
      value: (...args) => {
        ctx.clip(...args);
      }
    });

    Object.defineProperty(this, 'save', {
      value: (...args) => {
        ctx.save(...args);
      }
    });

    Object.defineProperty(this, 'restore', {
      value: (...args) => {
        ctx.restore(...args);
      }
    });

    Object.defineProperty(this, 'beginPath', {
      value: (...args) => {
        ctx.beginPath(...args);
      }
    });

    Object.defineProperty(this, 'closePath', {
      value: (...args) => {
        ctx.closePath(...args);
      }
    });

    Object.defineProperty(this, 'moveTo', {
      value: (...args) => {
        ctx.moveTo(...args);
      }
    });

    Object.defineProperty(this, 'lineTo', {
      value: (...args) => {
        ctx.lineTo(...args);
      }
    });

    Object.defineProperty(this, 'quadraticCurveTo', {
      value: (...args) => {
        ctx.quadraticCurveTo(...args);
      }
    });

    Object.defineProperty(this, 'bezierCurveTo', {
      value: (...args) => {
        ctx.bezierCurveTo(...args);
      }
    });

    Object.defineProperty(this, 'arc', {
      value: (...args) => {
        ctx.arc(...args);
      }
    });

    Object.defineProperty(this, 'rect', {
      value: (...args) => {
        ctx.rect(...args);
      }
    });

    Object.defineProperty(this, 'fillText', {
      value: (...args) => {
        ctx.fillText(...args);
      }
    });

    Object.defineProperty(this, 'strokeText', {
      value: (...args) => {
        ctx.strokeText(...args);
      }
    });

    Object.defineProperty(this, 'clearRect', {
      value: (...args) => {
        ctx.clearRect(...args);
      }
    });
  }

  _initEvent() {
    const eventNames = [{
      wxName: 'touchStart',
      ecName: 'mousedown'
    }, {
      wxName: 'touchMove',
      ecName: 'mousemove'
    }, {
      wxName: 'touchEnd',
      ecName: 'mouseup'
    }, {
      wxName: 'touchEnd',
      ecName: 'click'
    }];

    eventNames.forEach(name => {
      this.canvasNode.addEventListener(name.wxName, (e) => {
        const touch = e.touches[0];
        this.chart.getZr().handler.dispatch(name.ecName, {
          zrX: name.wxName === 'tap' ? touch.clientX : touch.x,
          zrY: name.wxName === 'tap' ? touch.clientY : touch.y,
          preventDefault: () => {},
          stopImmediatePropagation: () => {},
          stopPropagation: () => {}
        });
      });
    });
  }
}
