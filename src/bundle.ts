import type { Module } from "./core";

const entryRequireIndex = 0 

export function bundle(moduleList: Module[]) {
  let moduleContent = "";

  moduleList.forEach((module) => {
    moduleContent += `${
      module.module_id
    }: [function(require, exports){
        ${module.transformed}
        },${JSON.stringify(module.pathToModuleId)}],
        `;
  });

  const bundledModule = `{${moduleContent}}`;

  const bundledCode = `
    /** Bundled Code start from here */
    (function(modules){
        function __bundledRequire(id){
            const [exec, pathToMIdMap] = modules[id]

            function __requireDeps(relativePath){
                return __bundledRequire(pathToMIdMap[relativePath])
            }
            /** Current module exports */
            const __bundleModule = {
                exports: {}
            }
            exec(__requireDeps, __bundleModule.exports)
            return __bundleModule.exports
        }
        __bundledRequire(${entryRequireIndex})
    })(${bundledModule})
    /** Bundled Code ends */
  `;

  return bundledCode
}

