import fse from "fs-extra";
import path from "path";
import { parse } from "babylon";
import traverse, { Node } from "@babel/traverse";
import { transformFromAstSync } from "@babel/core";

import { getModuleId } from "./id";

interface Asset {
  module_id: number;
  filename: string;
  transformed: string;
  relativePathDeps: string[];
}

export interface Module extends Asset {
  pathToModuleId: Record<string, number>;
}

const supportEnd = ".js";

export async function generateAsset(filename: string): Promise<Asset> {
  return fse.readFile(filename).then((content) => {
    // get the raw conde
    const raw = content.toString("utf-8");
    // get the ast
    const ast = parse(raw, {
      sourceType: "module",
    });

    // depends
    const importDependences: string[] = [];

    // traverse ast
    traverse(ast as Node, {
      ImportDeclaration({ node }) {
        // add the depend
        importDependences.push(node.source.value);
      },
    });

    return {
      filename,
      module_id: getModuleId(),
      relativePathDeps: importDependences,
      // use babel transformed to cjs
      transformed:
        transformFromAstSync(ast as Node, undefined, {
            presets: ["@babel/preset-env"]
        })?.code || "",
    };
  });
}

export async function generateGraph(entry: string): Promise<Module[]> {
  const entryAsset = await generateAsset(entry);

  const assetQueue = [entryAsset];
  const moduleQueue: Module[] = [{ ...entryAsset, pathToModuleId: {} }];

  for (let i = 0; i < assetQueue.length; i++) {
    const dirStr = path.dirname(assetQueue[i].filename);

    // get the relativePathDeps absolute path
    for (let j = 0; j < assetQueue[i].relativePathDeps.length; j++) {
      const dep = assetQueue[i].relativePathDeps[j];

      const depAbsPath = path.join(dirStr, `${dep}${supportEnd}`);
      // generate depds asset & add module
      const depAsset = await generateAsset(depAbsPath);
      assetQueue.push(depAsset);
      moduleQueue.push({ ...depAsset, pathToModuleId: {} });
      // record deps id
      moduleQueue[i].pathToModuleId[assetQueue[i].relativePathDeps[j]] = depAsset.module_id
    }
  }

  return moduleQueue;
}

