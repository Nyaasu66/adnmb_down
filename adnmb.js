// 依赖引入
const jsdom = require("jsdom");
const https = require("https");
const fs = require("fs");
const zlib = require("zlib");
const { JSDOM } = jsdom;

const chan = process.argv[2]; // 串号

let str = "";  // 最终导出到txt的字符串
let page = 1;   // 页码初始化

if (!chan.match(/^[0-9]+$/)) {
  console.error("串号输入有误，请输入纯数字的串号，如：31163008");
  return
} else {
  console.log(`正在下载: No.${chan}`);
}

// 将请求的 option 转为函数, 实现翻页时 options.path 的 page 动态变化 
const options = (page) => {
  return {
    host: "adnmb3.com",
    port: 443,
    path: `/t/${chan}?page=${page}`,
  }
};

// 备胎岛
// const options = (page) => {
//   host: "tnmb.org",
//   port: 443,
//   path: `/t/${chan}?page=${page}`,
// };

// 最外层的 pre_req 用于获取最大页码
const pre_req = https.request(options(1), (res) => {
  if (res.statusCode == 502) {
    console.log("岛沉了，告辞");
  } else {
    console.log(`状态码: ${res.statusCode}, 开始获取索引`);
    let buffArr = [];
    let buff = null;
    res.on("data", (d) => {
      buffArr.length += 1;
      buffArr[buffArr.length - 1] = d;
    });
    res.on('end', () => {
      // 防止网站连续提供2个Buffer造成的报错
      buffArr.length > 1
      ? buff = Buffer.concat(buffArr)
      : buff = buffArr[0];
      // gunzip用于解压缩gzip编码
      zlib.gunzip(buff, async function (err, decoded) {
        let html = decoded.toString();
        const dom = new JSDOM(html);
        // 判断是否只有一页
        let page_first = dom.window.document
          .querySelector(".uk-pagination li:last-child")
          .getAttribute("class");
        if (page_first === 'uk-disabled') {
          page = 1;
        } else {
          // 获取[末页]按钮的实际跳转页数
          let page_str = dom.window.document
            .querySelector(".uk-pagination li:last-child a")
            .getAttribute("href")
            .match(/.+page=(.+)/)[1];
          page = parseInt(page_str);
          // 如果跳转页数为2，那么获取到的不是[末页]按钮，而是下一页，
          // 那么倒数第二个页码按钮为最大页数
          if (page === 2) {
            page_str = dom.window.document
            .querySelector(".uk-pagination li:nth-last-child(2) a")
            .getAttribute("href")
            .match(/.+page=(.+)/)[1];
            page = parseInt(page_str);
          }
        }
        console.log('page: ', page);
        // 等待所有页轮询完成
        await pageTurner(page);
        // 写入文件
        fs.mkdir('./download', { recursive: true },(err) => {if (err) console.log(err)})
        fs.writeFile(`./download/No.${chan}.txt`, str, function () {
          // console.log('str: ', str);
          console.log(`下载完成！保存在 ./download/No.${chan}.txt`);
        });

      });
    });
  }
});

pre_req.on("error", (error) => {
  console.error(error);
});

pre_req.end();

// 当前页所有楼层轮询器
const rowTurner = function(c) {
  return new Promise((resolve, reject) => {
    console.log('nowPage: ', c);
    const req = https.request(options(c), (res) => {
      let bufferArr = [];
      let buffer = null;
      res.on("data", (d) => {
        bufferArr.length += 1;
        bufferArr[bufferArr.length - 1] = d;
      });
      res.on('end', () => {
        // 防止网站连续提供2个Buffer造成的报错
        bufferArr.length > 1
        ? buffer = Buffer.concat(bufferArr)
        : buffer = bufferArr[0];
        zlib.gunzip(buffer, function (err, decoded) {
          // console.log(decoded.toString());// gzip解压后的html文本
          let html = decoded.toString();
          const dom = new JSDOM(html);
          // console.log(dom.window.document.querySelector(".h-threads-content").textContent);
          let outArr = dom.window.document.querySelectorAll(".h-threads-content");
          outArr.forEach((i, index) => {
            // console.log(i.textContent)
            // strArr[index] = i.textContent.replace(/ /gm,"")
            strOr = i.textContent.trim();
            // 条件判断当前楼层是否为当页主题层(第0层)，是的话显示 [x,po]
            (index == 0) ?
            row = `[${c},po]\n${strOr}\n` :
            row = `[${c},${index}]\n${strOr}\n`;
            str += row;
          });
          if (err) {
            console.log('err: ', err);
          }
          resolve();
        });
      });
    });
    
    req.on("error", (error) => {
      console.error(error);
    });
    
    req.end();
  })
}

// 当前串所有页轮询器
const pageTurner = async function(page) {
  for (let c = 1; c < page+1; c++) {
    // 等待当前页所有回应（楼层）轮询完成
    await rowTurner(c);
    str += '\n\n\n\n';
  }
}
