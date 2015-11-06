# Y86 Simulator

Y86 is a classical project in book CS:APP3e.

[y86.js.org](http://y86.js.org) is a Y86 pipeline CPU simulator implemented with JavaScript, and has a sci-fi UI design.

## Notes

1. All dependencies are packed (So I can use `gh-pages` as the main branch)
2. Please open `index.html` under a HTTP server, but please open with `file://` (`localhost` is fine)

## Details

Thanks [js.org](//js.org) for the pretty [y86.js.org](//y86.js.org) domain!

1. Using Angular & Angular-route framework
2. CSS3 animations by move.js
3. Implemented a simple CommonJS module loader and a curve garph in canvas

## License

- Author: Shu Ding.
- Thanks to: Linghao Zhang, Yifu Yu.
- License: WTFPL (Do What the Fuck You Want to Public License).

# Y86 Simulator

《CSAPP》课程 project，Y86 流水线模拟器。预览：[y86.js.org](http://y86.js.org)。

1. 所有依赖库都已打包（虽然不该这么做）
2. 本地请在 HTTP server 下打开 `src/index.html` 文件，否则 `file://` 会因无法跨域而错误

- 依赖于 Angular & Angular Route
- 动画效果基于 CSS 3，选择了 move.js
- 自己写了个简易的 CommonJS 加载函数，以及简易的 canvas curve graph
