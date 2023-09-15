import './style.css'
import javascriptLogo from './javascript.svg'
import axios from "axios";
import { TianaiCaptcha } from './lib/tianai-captcha.js'

document.querySelector('#app').innerHTML = `
  <div>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
    </a>
    <h1>hello tianai captcha!</h1>
    <div class="card">
      <button id="counter" type="button">开始验证</button>
    </div>
    
  </div>
`

let tianaiCaptcha;

document.querySelector('#counter').addEventListener('click', () => {
    console.info(location.origin);
    if (!tianaiCaptcha) {
        axios.get(import.meta.env.VITE_APP_SERVER_URL + "/resource/captcha/generateToken?type=tianai").then(r => {
            tianaiCaptcha = new TianaiCaptcha({
                appId:r.data.data.args.generate.appId,
                token:r.data.data.token.name,
                success:successFunction,
                error:console.error
            });
            tianaiCaptcha.show();
        });

    } else {
        tianaiCaptcha.show();
    }
});

function successFunction(data) {
    axios.post(import.meta.env.VITE_APP_SERVER_URL + "/resource/captcha/verifyCaptcha?captchaType=tianai&_tianaiCaptchaToken=" + tianaiCaptcha.config.token + "&_tianaiCaptcha=" + data.data + "&appId=" + tianaiCaptcha.config.appId).then(r => {
        setTimeout(() => {
            tianaiCaptcha.hide();
            tianaiCaptcha = undefined;
        }, 3000);
    }).catch(console.error);
}
