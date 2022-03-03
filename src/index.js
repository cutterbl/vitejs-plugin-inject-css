import fs from "fs";
import { resolve } from "path";
import createHash from "hash-generator";
const minify = require("@node-minify/core");
const cleanCSS = require("@node-minify/clean-css");

const fileRegex = /\.module\.(scss|less|css)(\?used)?$/;

const injector = `function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;
  if (!css || typeof document === 'undefined') { return; }
  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';
  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }
  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}`;

const injectCode = (value) => {
  const codeId = createHash(5);
  return `const css_${codeId} = "${value}";

styleInject(css_${codeId});

`;
};

const template = `console.warn("__INJECT__")`;

function buildOutput(extracts) {
  const out = [];
  extracts.forEach((value) => {
    out.push(injectCode(value));
  });
  return `
${injector}

${out.join("")}`;
}

let viteConfig;
const css = [];

export default function libInjectCss() {
  const extracted = new Map();

  return {
    name: "lib-inject-css",

    apply: "build",

    configResolved(resolvedConfig) {
      viteConfig = resolvedConfig;
    },

    async transform(code, id) {
      if (fileRegex.test(id)) {
        const minified = await minify({
          compressor: cleanCSS,
          content: code,
        });
        extracted.set(id, minified);
        css.push(code);
        return {
          code: "",
        };
      }
      if (id.includes(viteConfig.build.lib.entry)) {
        return {
          code: `${code}
${template}`,
        };
      }
      return null;
    },

    async writeBundle(_, bundle) {
      for (const file of Object.entries(bundle)) {
        const { root } = viteConfig;
        const outDir = viteConfig.build.outDir || "dist";
        const fileName = file[0];
        const filePath = resolve(root, outDir, fileName);

        try {
          let data = fs.readFileSync(filePath, {
            encoding: "utf8",
          });

          // eslint-disable-next-line max-depth
          if (data.includes(template)) {
            data = data.replace(template, buildOutput(extracted));
          }

          fs.writeFileSync(filePath, data);
        } catch (e) {
          console.error(e);
        }
      }
    },
  };
}
