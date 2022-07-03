export const importDependences: string[] = [];

let moduleId = 0;

export function getModuleId() {
  return moduleId++;
}
