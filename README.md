## A岛匿名版 - 串下载器

### 简介

使用 `Node.js` + `JSDOM` 写的 `js爬虫`，
实现下载`A岛匿名版`指定串的所有文本内容，并导出至txt的功能。

### 使用方法

1. 克隆/下载仓库到本地，使用 `yarn` / `npm install` 安装依赖
2. Windows 端直接双击`adnmb_downloader.bat`批处理文件，输入串号，回车，即可开始下载。
3. Linux / MacOS 端请使用 `node adnmb.js 串号` 指令进行下载。
4. 下载完成的串会存入 `./download` 文件夹

### To-do
- [ ] 给请求增加 `Header`, 加快访问速度
- [ ] 图片链接导出, ID导出功能
- [ ] 增加`导出为markdown格式`选项
- [ ] 使用 `Webpack` 反向代理实现**反防盗链**功能，并架设本地端口渲染
- [ ] 删除每页头部`po文`，增加`楼层`和显示`po主`, `串号`


### 注

`adnmb_downloader.bat`批处理文件如果要修改，请使用GBK编码打开，防止出现乱码
