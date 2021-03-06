const path = require('path');
const fs = require('fs-extra');
const co = require('co');
const postcss = require('postcss');
const syntax = require('postcss-scss');
const sass = require('node-sass');
const packageImporter = require('node-sass-package-importer');
const { logger } = require('../../utils');

const sassRender = options => {
    return new Promise((resolve, reject) => {
        sass.render(options, (err, result) => {
            err ? reject(err) : resolve(result);
        });
    });
};
const scss2AST = scss => postcss().process(scss, { syntax: syntax }).result.root;

module.exports = function(options) {
    return function(req, res, next) {
        co(function* () {
            if (req.method === 'GET' && /\/rebuildScss.json/.test(req.url)) {
                const { cwd } = options;
                const { componentName } = req.query;
                delete req.query.componentName;

                const entryPath = path.join(cwd, 'src', componentName, 'main.scss');
                const entryScss = yield fs.readFile(entryPath, 'utf8');
                const root = scss2AST(entryScss);
                const varsScss = Object.keys(req.query).reduce((ret, key) => {
                    return `${ret}\n${key}: ${req.query[key]};`;
                }, '');
                const varsRoot = scss2AST(varsScss);
                const improtVarIndex = root.nodes.findIndex(node =>
                    node.name === 'import' && /core\/index-noreset/.test(node.params));
                root.insertAfter(improtVarIndex, varsRoot);
                const newEntryScss = root.toResult().css;

                const result = yield sassRender({
                    data: newEntryScss,
                    includePaths: [path.join(cwd, 'src', componentName)],
                    importer: packageImporter({ cwd })
                });
                res.json({ css: result.css.toString() });
            } else {
                next();
            }
        }).catch(e => {
            logger.error(e.stack);
            res.status(500).send(e.stack);
            next();
        });
    };
};
