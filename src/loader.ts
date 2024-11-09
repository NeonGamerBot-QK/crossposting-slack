import { App } from "@slack/bolt";
import { readdirSync } from "fs";
import { QuickDB } from "quick.db";

export function loadModules(app: App, db: QuickDB) {
  const modules = readdirSync("./src/modules");
  modules.forEach((module) => {
    console.log(`Loading module ${module}`);
    require(`./modules/${module}`).default(app, db);
  });
}
