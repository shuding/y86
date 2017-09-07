# Y86 Emulator

[y86.js.org](http://y86.js.org) is a JavaScript powered, Y86 pipeline CPU emulator with a sci-fi UI (Y86 is a classical project in book CS:APP3e).

![screenshot](screenshot.png)

## Notes

1. All dependencies are packed into the repo. Since I'm using `gh-pages` as the main branch.
2. To open it locally, please host the static files under a HTTP server and do NOT open it with the `file://` protocol.

## Details

Thanks [js.org](//js.org) for the pretty [y86.js.org](//y86.js.org) domain!

1. Using Angular1 & Angular-route
2. move.js for CSS3 animations
3. Implemented a simple CommonJS module loader and a canvas curve graph plotter

## License

- Author: Shu Ding
- Special thanks: Linghao Zhang, Yifu Yu.
- License: the MIT license

# Y86 Emulator

《CSAPP》课程 project，Y86 流水线模拟器。预览：[y86.js.org](http://y86.js.org)。

1. 所有依赖库都已打包（虽然不该这么做）
2. 本地请在 HTTP server 下打开 `index.html` 文件，否则 `file://` 会因无法跨域而错误

- 依赖于 Angular & Angular Route
- 动画效果基于 CSS 3，选择了 move.js
- 自己写了个简易的 CommonJS 加载函数，以及简易的 canvas curve graph
