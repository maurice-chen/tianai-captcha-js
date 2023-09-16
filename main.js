import './style.css'
import javascriptLogo from './javascript.svg'
import axios from "axios";
import { TianaiCaptcha } from './src/lib/tianai-captcha.js'

document.querySelector('#app').innerHTML = `
  <div>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
    </a>
    <h1>hello tianai captcha!</h1>
    <div class="card">
      <button id="captcha" type="button">开始验证</button>
    </div>
    
  </div>
`

let tianaiCaptcha;

document.querySelector('#captcha').addEventListener('click', () => {

    /*if (!tianaiCaptcha) {
        axios.get(import.meta.env.VITE_APP_SERVER_URL + "/resource/captcha/generateToken?type=tianai").then(r => {

            let query = document.querySelector("script[id='tianai']");

            if (!query && import.meta.env.VITE_NODE_ENV !== 'development') {
                let script = document.createElement("script");
                script.id = "tianai";
                script.type = "text/javascript";
                script.src = r.data.data.args.generate.jsUrl;
                script.onload = () => {
                    tianaiCaptcha = new TianaiCaptcha({
                        appId:r.data.data.args.generate.appId,
                        token:r.data.data.token.name,
                        success:successFunction,
                        error:console.error
                    });
                    tianaiCaptcha.show();
                };
                document.body.appendChild(script);
            } else {
                tianaiCaptcha = new TianaiCaptcha({
                    appId:r.data.data.args.generate.appId,
                    token:r.data.data.token.name,
                    success:successFunction,
                    error:console.error
                });
                tianaiCaptcha.show();
            }

        });

    } else {
        tianaiCaptcha.show();
    }*/

    axios.get(import.meta.env.VITE_APP_SERVER_URL + "/resource/captcha/generateToken?type=tianai").then(r => {

        tianaiCaptcha = new TianaiCaptcha({
            appId:r.data.data.args.generate.appId,
            token:r.data.data.token.name,
            success:successFunction,
            error:console.error
        });
        tianaiCaptcha.show();

    });
});

function successFunction(data) {
    axios.post(import.meta.env.VITE_APP_SERVER_URL + "/resource/captcha/verifyCaptcha?captchaType=tianai&_tianaiCaptchaToken=" + tianaiCaptcha.config.token + "&_tianaiCaptcha=" + data.data + "&appId=" + tianaiCaptcha.config.appId).then(r => {
        setTimeout(() => {
            tianaiCaptcha.hide();
            tianaiCaptcha = undefined;
        }, 3000);
    }).catch(console.error);
}
