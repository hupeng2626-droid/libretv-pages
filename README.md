# LibreTV - 免费在线视频搜索与观看平台（GitHub Pages 直连版）

基于开源项目 [LibreTV](https://github.com/LibreSpark/LibreTV)（AGPL-3.0）与
[pages-LibreTV-V2](https://github.com/zhumengkang/pages-LibreTV-V2) 改造，
**纯静态部署，可直接运行在 GitHub Pages 上，无需任何服务器。**

## 使用

1. 访问站点（GitHub Pages 地址）
2. 输入访问密码（在 `config/master-config.js` 中设置）
3. 在搜索框输入想看的电影/电视剧名，聚合搜索后选择播放

## 关键改造点

- **浏览器直连采集站**：`js/config.js` 中 `DIRECT_MODE = true`，
  所有搜索/详情请求由浏览器直接发往采集站 API（不依赖任何服务端代理）
- **精选可用源**：仅保留实测「支持浏览器跨域(CORS) + HTTPS m3u8」的采集源：
  - 暴风资源（bfzyapi.com）
  - 量子资源（cj.lziapi.com）
  - 可在 设置 → 自定义API 中添加更多源（需支持 CORS）
- **豆瓣推荐**：首页热门影视通过公共跨域代理（allorigins）获取，封面图使用 no-referrer 直连

## 配置密码

编辑 `config/master-config.js`：

```js
auth: {
    username: 'admin',
    password: '你的密码',
    ...
}
```

修改后重新部署即可生效。

## 更换/新增采集源

编辑 `js/config.js` 中的 `API_SITES`。注意：源必须满足
**HTTPS + API 支持 CORS + m3u8 支持 CORS**，否则在纯静态部署下无法使用。

## 免责声明

本项目仅供学习和个人使用，请勿用于商业用途或公开服务；
内容来自第三方采集站，与本项目无关，如有侵权请联系相应来源删除。
