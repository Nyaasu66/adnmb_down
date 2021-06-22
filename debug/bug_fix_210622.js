// 依赖引入
const jsdom = require('jsdom');
const https = require('https');
const fs = require('fs');
const zlib = require('zlib');
// const { debug } = require("console");
const { JSDOM } = jsdom;

let str = ''; // 最终导出到txt的字符串
let page = 1; // 页码初始化
const chan = '39292860'; // 串号

const options = page => {
  return {
    host: 'adnmb3.com',
    port: 443,
    path: `/t/${chan}?page=${page}`,
  };
};

// debugger;
const req = https.request(options(2), res => {
  let bufferArr = [];
  res.on('data', d => {
    bufferArr.length += 1;
    bufferArr[bufferArr.length - 1] = d;
  });
  res.on('end', () => {
    // 防止网站连续提供2个Buffer造成的报错
    bufferArr.length > 1
    ? buffer = Buffer.concat(bufferArr)
    : buffer = bufferArr[0];
    zlib.gunzip(buffer, function (err, decoded) {
      console.log('gzip err: ', err);
      console.log(decoded.toString()); // gzip解压后的html文本
    });
  });
});

req.on('error', error => {
  console.error(error);
});

req.end();
