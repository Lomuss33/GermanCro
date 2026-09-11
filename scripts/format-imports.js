// Mechanical import cleanup: retain side effects, remove unused bindings, wrap long lists.
import fs from "node:fs/promises";
import path from "node:path";
import { parse } from "acorn";
import { analyze } from "eslint-scope";

async function visit(directory) {
  for (const item of await fs.readdir(directory, { withFileTypes:true })) {
    const file=path.join(directory,item.name);
    if(item.isDirectory()) await visit(file);
    else if(file.endsWith(".js")) {
      let source=await fs.readFile(file,"utf8");
      const ast=parse(source,{ecmaVersion:"latest",sourceType:"module",ranges:true});
      const scopes=analyze(ast,{ecmaVersion:2024,sourceType:"module"});
      const variables=scopes.scopes.find(scope=>scope.type==="module").variables;
      const unused=new Set(variables.filter(v=>v.defs[0]?.type==="ImportBinding" && !v.references.length).map(v=>v.name));
      for(const node of ast.body.filter(n=>n.type==="ImportDeclaration").reverse()) {
        const specifiers=node.specifiers.filter(s=>!unused.has(s.local.name));
        const url=JSON.stringify(node.source.value.split("?")[0]);
        let replacement;
        if(!specifiers.length) replacement=`import ${url};`;
        else if(specifiers.every(s=>s.type==="ImportSpecifier")) {
          const names=specifiers.map(s=>s.imported.name===s.local.name?s.local.name:`${s.imported.name} as ${s.local.name}`);
          const inline=`import { ${names.join(", ")} } from ${url};`;
          replacement=inline.length<=110?inline:`import {\n${names.map(n=>`  ${n},`).join("\n")}\n} from ${url};`;
        } else continue;
        source=source.slice(0,node.start)+replacement+source.slice(node.end);
      }
      await fs.writeFile(file,source.replace(/\n{3,}/g,"\n\n"));
    }
  }
}
await visit("src");
