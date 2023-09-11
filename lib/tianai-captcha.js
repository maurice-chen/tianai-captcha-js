import axios from "axios";
import './style/tianai-captcha.css'

class TianaiCaptcha {
  constructor(config) {
    this.config = config;

    this.config.postConfig = this.config.postConfig || {
      captchaParamName:'_tianaiCaptcha',
      appIdParamName:'appId',
      tokenParamName:'_tianaiCaptchaToken'
    }
    this.config.dateFormat = this.config.dateFormat || "yyyy-MM-dd HH:mm:ss'";
    this.config.loadingText = this.config.loadingText || "加载中...";
    this.config.validText = this.config.validText || '验证中...'

    this.overlayTemplate = `<div class="__tianai-overlay" id="__tianai-overlay"></div>`
    this.containerTemplate = `<div class="__tianai-container" id="tianai-container"></div>`

    this.contentTemplate = `
        <div class="__tianai-content" style="width:${this.config.width || 400}px" id="tianai-content">
          <div class="__tianai-content-title">
            <div class="__tianai-content-title-text">安全拦截</div>
            <div class="__tianai-content-title-close" id="tianai-content-close-btn"></div>
          </div>
          
        </div>
    `
    this.contentWrapper = `
        <div class="__tianai-content-image-wrapper" id="tianai-content-image-wrapper">
          <div class="__tianai-content-image-bg" id="tianai-content-image-bg">
          </div>
          <div class="__tianai-content-target" id="tianai-image-content-target">
          </div>
        </div>
        <div class="__tianai-slider-move">
          <div class="__tianai-slider-move-track">
            拖动滑块完成验证
          </div>
          <div class="__tianai-slider-move-btn" id="tianai-slider-move-btn">
          </div>
        </div>
        <div class="__tianai-operating">
          <div class="__tianai-operating-merchant">
            ${this.config.merchantName || ''}
          </div>
        </div>
    `
  }
  show() {

    let tianaiContent = document.getElementById("tianai-content");

    if (!tianaiContent) {
      let container = this.config.container;
      if (!container) {
        container = document.body;
      } else {
        container = document.getElementById(this.config.container);
      }
      container.insertAdjacentHTML('beforeend',this.containerTemplate);
      container.lastElementChild.insertAdjacentHTML('beforeend',this.overlayTemplate);
      container.lastElementChild.insertAdjacentHTML('beforeend',this.contentTemplate);
    }

    document.getElementById("tianai-content-close-btn").addEventListener("click", this.hide);

    this.generateCaptcha();
  }
  generateCaptcha() {
    this.loading(this.config.loadingText);
    let param = {};

    param[this.config.postConfig.tokenParamName] = this.config.token;
    param[this.config.postConfig.appIdParamName] = this.config.appId;

    param["captchaType"] = "tianai";
    param["generateImageType"] = this.config.generateType || 'SLIDER';

    axios
        .post("/api/resource/captcha/generateCaptcha", this.formUrlEncoded(param))
        .then(r => this.doGenerateHtml(r.data.data))
        .catch(r => this.config.error);
  }
  doGenerateHtml(data) {
    this.generateData = data;
    const loading = document.getElementById("tianai-loading");
    if (loading) {
      loading.remove();
    }
    const wrapper = document.getElementById("tianai-content-image-wrapper");

    if (!wrapper) {
      document.getElementById("tianai-content").insertAdjacentHTML('beforeend',this.contentWrapper);
      document.getElementById("tianai-slider-move-btn").addEventListener("mousedown",  this.sliderDown.bind(this));
    }

    const imageBg = document.getElementById("tianai-content-image-bg");
    let img = imageBg.lastElementChild;
    if (!img) {
      imageBg.insertAdjacentHTML('beforeend', `<img src="${data.backgroundImage}">`);
    } else {
      img.src = data.backgroundImage;
    }

    this.validValue = {
      startX:0,
      startY:0,
      startTime:new Date(),
      trackArr:[]
    };

    setTimeout(() => {
      this.validValue.bgImageWidth = imageBg.offsetWidth;
      this.validValue.bgImageHeight = imageBg.offsetHeight;
    }, 500);

    const targetBg = document.getElementById("tianai-image-content-target");
    if (["SLIDER","ROTATE"].includes(data.type)) {
      const targetTemplate = document.getElementById("image-content-target-template");

      if (targetTemplate) {
        targetTemplate.src = data.templateImage;
      } else {
        targetBg.insertAdjacentHTML('beforeend', `<img src="${data.templateImage}" id="image-content-target-template">`);
        setTimeout(() => {
          this.validValue.sliderImageWidth = targetBg.lastElementChild.offsetWidth;
          this.validValue.sliderImageHeight = targetBg.lastElementChild.offsetHeight;
        }, 500);
      }

      if (data.type === 'SLIDER') {
        targetBg.style.transform = "translate(0px, 0px)";
        this.validValue.end = this.validValue.bgImageWidth - this.validValue.sliderImageWidth;
      }
    } else {
      document.getElementById("image-content-target-template").remove();
    }

    targetBg.classList.add(data.type.toLowerCase());

    document.getElementById("tianai-slider-move-btn").style.transform = "translate(0px, 0px)";
    //this.removeLoading();
  }
  formUrlEncoded(json, ignoreProperties, valueConvert) {
    let param = new URLSearchParams();

    let ignore = [];

    if (typeof ignoreProperties === 'string') {
      ignore.push(ignoreProperties);
    } else {
      ignore = ignoreProperties || [];
    }

    for (let j in json) {

      if (ignore.includes(j)) {
        continue;
      }

      let val = json[j];

      if (val === undefined || val === null) {
        continue;
      }

      if (valueConvert) {
        val = valueConvert(j, val);
      }

      if (Array.isArray(val)) {
        val.forEach(v => param.append(j, v));
      } else {
        param.append(j, val);
      }

    }

    return param;
  }
  hide(e) {
    const target = document.getElementById("tianai-container");
    if (!target) {
      return ;
    }

    target.remove();
  }
  sliderDown(event) {

    let targetTouches = event.originalEvent ? event.originalEvent.targetTouches : event.targetTouches;

    let startX = event.pageX;
    let startY = event.pageY;

    if (startX === undefined) {
      startX = Math.round(targetTouches[0].pageX);
      startY = Math.round(targetTouches[0].pageY);
    }

    this.validValue.startX = startX;
    this.validValue.startY = startY;

    const pageX = this.validValue.startX;
    const pageY = this.validValue.startY;

    const startTime = this.validValue.startTime;
    const trackArr = this.validValue.trackArr;

    trackArr.push({
      x: pageX - startX,
      y: pageY - startY,
      type: "down",
      t: (new Date().getTime() - startTime.getTime())
    });

    this.validValue.mouseMoveFunction = this.move.bind(this);
    this.validValue.mouseUpFunction = this.up.bind(this);

    // pc
    window.addEventListener("mousemove", this.validValue.mouseMoveFunction);
    window.addEventListener("mouseup", this.validValue.mouseUpFunction);
    // 手机端
    window.addEventListener("touchmove", this.validValue.mouseMoveFunction, false);
    window.addEventListener("touchend", this.validValue.mouseUpFunction, false);
  }
  move(event) {
    if (event instanceof TouchEvent) {
      event = event.touches[0];
    }
    let pageX = Math.round(event.pageX);
    let pageY = Math.round(event.pageY);

    const startX = this.validValue.startX;
    const startY = this.validValue.startY;

    const startTime = this.validValue.startTime;
    const end = this.validValue.end;

    const bgImageWidth = this.validValue.bgImageWidth;
    const trackArr = this.validValue.trackArr;

    let moveX = pageX - startX;
    const track = {
      x: pageX - startX,
      y: pageY - startY,
      type: "move",
      t: (new Date().getTime() - startTime.getTime())
    };
    trackArr.push(track);
    if (moveX < 0) {
      moveX = 0;
    } else if (moveX > end) {
      moveX = end;
    }
    this.validValue.moveX = moveX;
    this.validValue.movePercent = moveX / bgImageWidth;

    this[this.generateData.type.toLowerCase() + "Move"]();
  }
  sliderMove() {
    const moveX = this.validValue.moveX;
    document.getElementById("tianai-slider-move-btn").style.transform = "translate(" + moveX + "px, 0px)";
    document.getElementById("tianai-image-content-target").style.transform = "translate(" + moveX + "px, 0px)";
  }
  up(event) {

    window.removeEventListener("mousemove", this.validValue.mouseMoveFunction);
    window.removeEventListener("mouseup", this.validValue.mouseUpFunction);

    window.removeEventListener("touchmove", this.validValue.mouseMoveFunction);
    window.removeEventListener("touchend", this.validValue.mouseUpFunction);

    if (event instanceof TouchEvent) {
      event = event.changedTouches[0];
    }

    this.validValue.stopTime = new Date();

    let pageX = Math.round(event.pageX);
    let pageY = Math.round(event.pageY);

    const startX = this.validValue.startX;
    const startY = this.validValue.startY;

    const startTime = this.validValue.startTime;
    const trackArr = this.validValue.trackArr;

    const track = {
      x: pageX - startX,
      y: pageY - startY,
      type: "up",
      t: (new Date().getTime() - startTime.getTime())
    }

    trackArr.push(track);

    this.valid();
  }
  valid() {
    const data = {
      bgImageWidth: this.validValue.bgImageWidth,
      bgImageHeight: this.validValue.bgImageHeight,
      templateImageWidth: this.generateData.templateImageWidth,
      templateImageHeight: this.generateData.templateImageHeight,
      startSlidingTime: this.formatDate(this.validValue.startTime, this.config.dateFormat),
      entSlidingTime: this.formatDate(this.validValue.stopTime, this.config.dateFormat),
      trackList: this.validValue.trackArr
    };

    console.info(data);
    this.loading(this.config.validText);
    axios
        .post("/api/resource/captcha/verifyCaptcha?" + this.config.postConfig.tokenParamName + "=" + this.config.token + "&captchaType=tianai", data)
        .then(r => {
          this.validResult = r.data;
          this.generateCaptcha();
        })
        .catch(() => this.generateCaptcha());
  }
  formatDate(date, format) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    format = format.replace('yyyy', year);
    format = format.replace('MM', month);
    format = format.replace('dd', day);
    format = format.replace('HH', hours);
    format = format.replace('mm', minutes);
    format = format.replace('ss', seconds);

    return format;
  }
  loading(text) {
    const target = document.getElementById("tianai-loading");
    if (target) {
      return ;
    }
    let content = document.getElementById("tianai-content");
    const template = `
    <div class="__tianai-content-loading" id="tianai-loading">
      <div class="__tianai-content-loading-loader"></div>
      <div class="__tianai-content-loading-text">
        ${text}
      </div>
    </div>
    `
    content.insertAdjacentHTML("beforeend", template);
  }
}

export {
  TianaiCaptcha
}
