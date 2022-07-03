import fse from "fs-extra";

import { bundle } from "./bundle";
import { generateGraph } from "./core";


export async function start(
  entryPath: string,
  outputPath: string,
  errCallback?: (err: NodeJS.ErrnoException) => void
) {
  return generateGraph(entryPath)
    .then((queue) => bundle(queue))
    .then((code) =>
      fse.outputFile(outputPath, code, (err) => err && errCallback && errCallback(err))
    );
}
