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
      <button id="counter" type="button">展示验证码</button>
    </div>
    
  </div>
`

let tianaiCaptcha;

document.querySelector('#counter').addEventListener('click', () => {
    if (!tianaiCaptcha) {
        axios.get("/api/resource/captcha/generateToken?type=tianai").then(r => {
            tianaiCaptcha = new TianaiCaptcha({
                appId:r.data.data.args.generate.appId,
                token:r.data.data.token.name,
                success:console.info,
                error:console.error

            });
            tianaiCaptcha.show();
        });

    } else {
        tianaiCaptcha.show();
    }
});
